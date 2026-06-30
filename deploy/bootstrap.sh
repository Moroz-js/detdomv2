#!/usr/bin/env bash
#
# Серверная настройка detdom (Ubuntu 22.04).
# Запуск на сервере:
#
#   curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/deploy/bootstrap.sh | sudo bash
#
# Скрипт спросит нужные значения интерактивно.
# Идемпотентен: повторный запуск не ломает уже настроенное.
# Дамп Neon заливается только при первом запуске (или FORCE_DUMP=1).
#
# nginx НЕ настраивается — это на тебе. Приложение слушает 127.0.0.1:3000.

set -euo pipefail

# ---------- Захардкоженные пути/имена ----------
DEPLOY_USER="detdom"
APP_DIR="/var/www/detdom"
MEDIA_DIR="${APP_DIR}/media"
DB_NAME="detdom"
DB_USER="detdom"
PG_VERSION="17"
NODE_MAJOR="20"
DEFAULT_SITE_URL="https://staging.detskiydomuss.ru"

PG_BIN="/usr/lib/postgresql/${PG_VERSION}/bin"
export PATH="$PG_BIN:$PATH"
FORCE_DUMP="${FORCE_DUMP:-0}"

log() { echo -e "\n\033[1;36m==> $*\033[0m"; }

if [ "$(id -u)" -ne 0 ]; then
  echo "Запусти через sudo"; exit 1
fi

# ---------- Интерактивный ввод ----------
ask() {
  # ask VARNAME "Вопрос" "значение по умолчанию" [secret]
  local var="$1" q="$2" def="${3:-}" mode="${4:-}" val=""
  if [ -n "${!var:-}" ]; then return; fi          # уже задано через env — не спрашиваем
  local label="$q"
  [ -n "$def" ] && label="$q [$def]"
  if [ "$mode" = "secret" ]; then
    read -rs -p "$label: " val </dev/tty; echo >/dev/tty
  else
    read -r -p "$label: " val </dev/tty
  fi
  printf -v "$var" '%s' "${val:-$def}"
}

log "Параметры установки"
ask REPO_URL            "Git-репозиторий (git@github.com:owner/repo.git)"
ask NEON_URL            "Строка подключения к Neon (sslmode=require)" "" secret
ask DB_PASSWORD         "Пароль для локальной Б Postgres" "" secret
ask NEXT_PUBLIC_SITE_URL "Адрес сайта" "$DEFAULT_SITE_URL"
ask PAYLOAD_SECRET      "PAYLOAD_SECRET (Enter — сгенерировать)" ""
ask PREVIEW_SECRET      "PREVIEW_SECRET (Enter — сгенерировать)" ""

[ -z "$REPO_URL" ]    && { echo "REPO_URL обязателен"; exit 1; }
[ -z "$NEON_URL" ]    && { echo "NEON_URL обязателен"; exit 1; }
[ -z "$DB_PASSWORD" ] && { echo "DB_PASSWORD обязателен"; exit 1; }
[ -z "$PAYLOAD_SECRET" ] && PAYLOAD_SECRET="$(openssl rand -hex 32)"
[ -z "$PREVIEW_SECRET" ] && PREVIEW_SECRET="$(openssl rand -hex 32)"

LOCAL_DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"

# ---------- 1. Пакеты ----------
log "Базовые пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates gnupg lsb-release git ufw openssl

# ---------- 2. Node.js ----------
if ! command -v node >/dev/null || [ "$(node -v | cut -c2-3)" -lt "$NODE_MAJOR" ]; then
  log "Node.js ${NODE_MAJOR}.x"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

# ---------- 3. PostgreSQL ${PG_VERSION} (PGDG) ----------
if ! command -v "${PG_BIN}/pg_dump" >/dev/null 2>&1; then
  log "PostgreSQL ${PG_VERSION} из PGDG"
  install -d /usr/share/postgresql-common/pgdg
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
  echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update -y
  apt-get install -y "postgresql-${PG_VERSION}"
fi
systemctl enable --now postgresql

# ---------- 4. Пользователь деплоя ----------
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  log "Создаю пользователя $DEPLOY_USER"
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi

# ---------- 5. БД и роль ----------
log "PostgreSQL: роль и база"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "ALTER ROLE ${DB_USER} PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"

# ---------- 6. SSH deploy-key (сервер -> GitHub) ----------
DEPLOY_HOME="$(getent passwd "$DEPLOY_USER" | cut -d: -f6)"
KEY="${DEPLOY_HOME}/.ssh/id_ed25519"
if [ ! -f "$KEY" ]; then
  log "Генерирую deploy-key для GitHub"
  sudo -u "$DEPLOY_USER" mkdir -p "${DEPLOY_HOME}/.ssh"
  sudo -u "$DEPLOY_USER" ssh-keygen -t ed25519 -N "" -C "${DEPLOY_USER}@detdom" -f "$KEY"
fi
sudo -u "$DEPLOY_USER" bash -lc "ssh-keyscan -t ed25519 github.com >> ${DEPLOY_HOME}/.ssh/known_hosts 2>/dev/null" || true

# ---------- 7. Клон / обновление репо ----------
log "Репозиторий"
if [ ! -d "${APP_DIR}/.git" ]; then
  install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR"
  if ! sudo -u "$DEPLOY_USER" git clone "$REPO_URL" "$APP_DIR"; then
    echo
    echo "!!! Не удалось склонировать (приватный репо)."
    echo "    Добавь этот публичный ключ в GitHub → Settings → Deploy keys (Read):"
    echo "    ------------------------------------------------------------"
    cat "${KEY}.pub"
    echo "    ------------------------------------------------------------"
    echo "    Затем перезапусти этот же скрипт."
    exit 1
  fi
else
  sudo -u "$DEPLOY_USER" git -C "$APP_DIR" fetch --all --prune
  sudo -u "$DEPLOY_USER" git -C "$APP_DIR" reset --hard origin/main
fi

# ---------- 8. Папка media (не перезаписывать существующие файлы) ----------
log "Папка media"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$MEDIA_DIR"
# media в .gitignore, поэтому clone/reset её не трогают — содержимое сохраняется.

# ---------- 9. Дамп Neon + переписать URL медиа на /media ----------
HAS_NEWS="$(PGPASSWORD="$DB_PASSWORD" psql "$LOCAL_DB_URL" -tAc "SELECT to_regclass('public.news')" || true)"
if [ "$HAS_NEWS" != "news" ] || [ "$FORCE_DUMP" = "1" ]; then
  log "Заливаю дамп из Neon и переписываю URL медиа на /media"
  DUMP="/tmp/neon-$(date +%F-%H%M).sql"
  # libpq/pg_dump не понимает кастомные параметры (например uselibpqcompat) — вырезаем
  NEON_URL_CLEAN="$(printf '%s' "$NEON_URL" \
    | sed -E 's/(&)?uselibpqcompat=[^&]*//g' \
    | sed -E 's/\?&/?/; s/&&/\&/g; s/[?&]$//')"
  pg_dump "$NEON_URL_CLEAN" --no-owner --no-acl --clean --if-exists -F p -f "$DUMP"
  sed -i -E 's#https?://detskiydomuss\.ru/wp-content/uploads#/media#g' "$DUMP"
  PGPASSWORD="$DB_PASSWORD" psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=0 -f "$DUMP"
  rm -f "$DUMP"
else
  echo "    Таблица news уже есть — пропускаю дамп (FORCE_DUMP=1 чтобы перезалить)."
fi

# ---------- 10. .env ----------
log "Файл .env"
cat > "${APP_DIR}/.env" <<EOF
NODE_ENV=production
DATABASE_URL_PROD=${LOCAL_DB_URL}
DATABASE_URL=${LOCAL_DB_URL}
PAYLOAD_SECRET=${PAYLOAD_SECRET}
PREVIEW_SECRET=${PREVIEW_SECRET}
NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
PORT=3000
EOF
chown "$DEPLOY_USER:$DEPLOY_USER" "${APP_DIR}/.env"
chmod 600 "${APP_DIR}/.env"

# ---------- 11. Зависимости и сборка ----------
log "npm ci && migrate && build"
sudo -u "$DEPLOY_USER" bash -lc "cd '${APP_DIR}' && npm ci && npm run migrate && npm run build"

# ---------- 12. systemd ----------
log "systemd unit detdom.service"
cat > /etc/systemd/system/detdom.service <<EOF
[Unit]
Description=detdom (Next.js + Payload)
After=network.target postgresql.service

[Service]
Type=simple
User=${DEPLOY_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now detdom
systemctl restart detdom

# CI должен иметь право перезапускать сервис без пароля
echo "${DEPLOY_USER} ALL=(root) NOPASSWD: /usr/bin/systemctl restart detdom, /usr/bin/systemctl status detdom" \
  > /etc/sudoers.d/detdom
chmod 440 /etc/sudoers.d/detdom

# ---------- 13. Firewall ----------
ufw allow OpenSSH >/dev/null 2>&1 || true
yes | ufw enable >/dev/null 2>&1 || true

# ---------- Готово ----------
echo -e "\n\033[1;32mГотово.\033[0m\n"
cat <<EOF
Приложение слушает 127.0.0.1:3000 (nginx настрой сам и проксируй на него + раздачу /media).

Сгенерированные секреты (сохрани!):
  PAYLOAD_SECRET=${PAYLOAD_SECRET}
  PREVIEW_SECRET=${PREVIEW_SECRET}

Сервис:   sudo systemctl status detdom
Логи:     sudo journalctl -u detdom -f
EOF
