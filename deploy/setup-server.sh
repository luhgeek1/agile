#!/usr/bin/env bash
set -euo pipefail
# Run as root after installing nginx, PostgreSQL, python3-venv and certbot.
# Source archive: /tmp/kopilka-backend.tar.gz (backend/ and deploy/).
id kopilka >/dev/null 2>&1 || useradd --system --home-dir /opt/kopilka --shell /usr/sbin/nologin kopilka
install -d -o root -g kopilka -m 755 /opt/kopilka
tar -xzf /tmp/kopilka-backend.tar.gz -C /opt/kopilka
python3 -m venv /opt/kopilka/venv
/opt/kopilka/venv/bin/pip install --require-hashes -r /opt/kopilka/backend/requirements.lock
systemctl enable --now postgresql
if ! runuser -u postgres -- psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='kopilka'" | /usr/bin/grep -q 1; then
    runuser -u postgres -- createuser kopilka
fi
if ! runuser -u postgres -- psql -tAc "SELECT 1 FROM pg_database WHERE datname='kopilka'" | /usr/bin/grep -q 1; then
    runuser -u postgres -- createdb -O kopilka kopilka
fi
install -d -o root -g kopilka -m 750 /etc/kopilka
if [ ! -f /etc/kopilka/api.env ]; then
    cat > /etc/kopilka/api.env <<'EOF'
DATABASE_URL=postgresql+psycopg:///kopilka?host=/var/run/postgresql
ALLOWED_ORIGINS=https://kopilka-demo-rust.vercel.app,https://kopilka.170.168.10.196.sslip.io
COOKIE_SECURE=true
DEMO_ENABLED=true
EOF
    chown root:kopilka /etc/kopilka/api.env
    chmod 640 /etc/kopilka/api.env
fi
cp /opt/kopilka/deploy/kopilka-api.service /etc/systemd/system/
cp /opt/kopilka/deploy/kopilka-backup.{service,timer} /etc/systemd/system/
install -d -o postgres -g postgres -m 700 /var/backups/kopilka
cp /opt/kopilka/deploy/nginx.conf /etc/nginx/sites-available/kopilka
ln -sfn /etc/nginx/sites-available/kopilka /etc/nginx/sites-enabled/kopilka
nginx -t
systemctl daemon-reload
systemctl enable --now kopilka-api kopilka-backup.timer nginx
systemctl restart kopilka-api
systemctl reload nginx
systemctl start kopilka-backup.service
certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email --redirect -d kopilka.170.168.10.196.sslip.io
systemctl is-active kopilka-api
curl --fail --retry 5 --retry-delay 2 https://kopilka.170.168.10.196.sslip.io/api/health
