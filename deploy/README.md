# Размещение

## Адреса

- Локальная версия: http://127.0.0.1:5173
- Frontend (Vercel): https://kopilka-demo-rust.vercel.app
- API: https://kopilka.170.168.10.196.sslip.io/api/health
- Swagger: https://kopilka.170.168.10.196.sslip.io/api/docs

Frontend использует `/api` на своём домене. `vercel.json` проксирует `/api` на backend по HTTPS; страницы обслуживает Next.js App Router. SPA fallback на `index.html` удалён. Cookie — Secure, HttpOnly, SameSite=Strict. API разрешает изменения только с явно перечисленных источников.

Технический домен sslip.io зависит от внешнего DNS-сервиса. Для собственного домена измените nginx, сертификат, `ALLOWED_ORIGINS` и адрес прокси в `vercel.json`.

## Сервер

Ubuntu 24.04, PostgreSQL 16, nginx, Python virtualenv. Исходники: `/opt/kopilka/backend`; зависимости: `/opt/kopilka/venv`; настройки: `/etc/kopilka/api.env`. Служба `kopilka-api` работает от системного пользователя `kopilka`, слушает только `127.0.0.1:8017` и автоматически запускается после перезагрузки. Миграции применяются перед запуском.

PostgreSQL использует локальную peer-аутентификацию через Unix socket: пароль базы не нужен и не хранится в репозитории. База и роль называются `kopilka`.

```sh
systemctl status kopilka-api
journalctl -u kopilka-api -n 100 --no-pager
systemctl restart kopilka-api
certbot certificates
systemctl status certbot.timer
```

`kopilka-backup.timer` ежедневно сохраняет PostgreSQL dump в `/var/backups/kopilka`, хранит копии 14 дней. Это копии на том же сервере; внешнее хранение не подключено.

```sh
systemctl start kopilka-backup.service
systemctl list-timers kopilka-backup.timer
```

## Обновление

Из корня репозитория:

```sh
COPYFILE_DISABLE=1 tar -czf /tmp/kopilka-backend.tar.gz \
  --exclude='.venv' --exclude='__pycache__' --exclude='.pytest_cache' \
  --exclude='.ruff_cache' --exclude='*.db' --exclude='*.egg-info' \
  --exclude='.env' backend deploy
scp /tmp/kopilka-backend.tar.gz root@170.168.10.196:/tmp/
```

На сервере перед обновлением создайте резервную копию, затем распакуйте исходники и перезапустите службу:

```sh
systemctl start kopilka-backup.service
tar -xzf /tmp/kopilka-backend.tar.gz -C /opt/kopilka
/opt/kopilka/venv/bin/pip install --require-hashes -r /opt/kopilka/backend/requirements.lock
systemctl restart kopilka-api
curl --fail https://kopilka.170.168.10.196.sslip.io/api/health
```

Для первоначальной установки есть `setup-server.sh`. Повторный запуск перезаписывает nginx-конфигурацию; для обычного обновления используйте команды выше.

Публикация frontend из корня: `vercel deploy --prod`. `vercel.json` задаёт framework `nextjs`, сборку workspace и output `frontend/.next`; `/api` остаётся same-origin прокси к FastAPI. Для локальной проверки Vercel-сборки без публикации: `vercel build --prod`. Автоматическое размещение из GitHub отключено; текущий деплой загружен из локальной рабочей копии. Секреты и файлы бэкенда исключены из загрузки через `.vercelignore`. Production API разрешает основной адрес Vercel; новые домены нужно добавить в `/etc/kopilka/api.env` и перезапустить службу.

Приложение опубликовано в существующем режиме изолированного демо. Полноценная регистрация семей и реальная банковская интеграция в проекте отсутствуют.
