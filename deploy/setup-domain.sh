#!/usr/bin/env bash
#
# Настройка nginx + выпуск SSL под домен. Запускается от root.
#
#   bash deploy/setup-domain.sh <domain> [email]
#
# Идемпотентен: можно гонять при каждой смене домена.

set -euo pipefail

DOMAIN="${1:?Использование: setup-domain.sh <domain> [email]}"
APP_DIR="/var/www/detdom"
MEDIA_DIR="${APP_DIR}/media"

ADMIN_EMAIL="${2:-}"
if [ -z "$ADMIN_EMAIL" ] && [ -f "${APP_DIR}/.env" ]; then
  ADMIN_EMAIL="$(grep -E '^ADMIN_EMAIL=' "${APP_DIR}/.env" | cut -d= -f2- || true)"
fi
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@${DOMAIN}}"

echo "==> nginx для ${DOMAIN}"
cat > /etc/nginx/sites-available/detdom <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    client_max_body_size 64M;

    location /media/ {
        alias ${MEDIA_DIR}/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public";
        try_files \$uri =404;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
ln -sf /etc/nginx/sites-available/detdom /etc/nginx/sites-enabled/detdom
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> SSL для ${DOMAIN}"
if certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${ADMIN_EMAIL}" --redirect; then
  echo "    Сертификат выпущен/обновлён."
else
  echo "    !!! certbot не смог выпустить сертификат."
  echo "        Проверь, что DNS ${DOMAIN} указывает на этот сервер, и повтори:"
  echo "        sudo certbot --nginx -d ${DOMAIN} --agree-tos -m ${ADMIN_EMAIL} --redirect"
fi

# маркер текущего домена — по нему CI понимает, что домен сменился
echo "${DOMAIN}" > "${APP_DIR}/.deployed_domain"
echo "==> Готово: ${DOMAIN}"
