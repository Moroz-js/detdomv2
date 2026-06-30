# Деплой detdom

Прод: Ubuntu 22.04 + Node 20 + PostgreSQL 17 (служба, не Docker) + systemd.
Next.js (`next start`) слушает `127.0.0.1:3000`. **nginx настраиваешь сам** и
проксируешь на :3000 + раздаёшь статику `/media/` из `/var/www/detdom/media`.

Все пути захардкожены:
- приложение — `/var/www/detdom`
- медиа — `/var/www/detdom/media`
- пользователь — `detdom`, база/роль — `detdom`

## 1. GitHub Secrets

| Secret | Назначение |
|--------|-----------|
| `SSH_HOST` | IP/домен сервера (CI → сервер) |
| `SSH_USER` | пользователь деплоя (`detdom`) |
| `SSH_KEY` | приватный SSH-ключ (CI → сервер) |
| `SSH_PORT` | опционально, по умолчанию 22 |
| `NEXT_PUBLIC_SITE_URL` | адрес сайта; CI пишет его в `.env` при каждом деплое |

`NEON_URL` в CI не нужен — он используется только при ручной настройке сервера
(можешь хранить его в секретах просто чтобы было откуда скопировать).

## 2. Первичная настройка сервера

Зайди по SSH и запусти — скрипт спросит значения интерактивно:

```bash
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/deploy/bootstrap.sh | sudo bash
```

Спросит: Git-репозиторий, `NEON_URL`, пароль БД, адрес сайта
(по умолчанию `https://staging.detskiydomuss.ru`), `PAYLOAD_SECRET`/`PREVIEW_SECRET`
(Enter — сгенерирует).

Что делает: ставит Node 20, PostgreSQL 17 (PGDG), создаёт пользователя/базу,
генерирует deploy-key для GitHub (если клон приватного репо упадёт — покажет ключ,
добавь в **Deploy keys** и перезапусти), создаёт `media/` (существующие файлы не
трогает), делает `pg_dump` из Neon с заменой `…/wp-content/uploads` → `/media`,
пишет `.env`, билдит и поднимает systemd-сервис `detdom`.

Перезалить дамп:  `FORCE_DUMP=1 sudo -E bash` (или `sudo FORCE_DUMP=1 bash`).

## 3. Заливка медиа с локальной машины

```bash
cp deploy/.env.deploy.example deploy/.env.deploy   # заполни
npm run deploy:media
```

Инкрементальная заливка `LOCAL_MEDIA_DIR` → `/var/www/detdom/media` по SFTP
(файлы того же размера пропускает), прогресс-бар и проверка, что `/media/...`,
`/`, `/news`, `/documents` отвечают 200.

> Существующие PDF Payload (приказы по медиации) тоже положи в `LOCAL_MEDIA_DIR`
> или скопируй вручную в `media/` — иначе документы отвалятся.

## 4. Дальнейшие деплои

`git push` в `main` → GitHub Actions зайдёт по SSH, обновит `.env` адресом сайта,
подтянет код, прогонит миграции, пересоберёт и перезапустит сервис.

## Полезное

```bash
sudo systemctl status detdom
sudo journalctl -u detdom -f
```
