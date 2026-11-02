# Размещение

## Адреса

- Локальная версия: http://127.0.0.1:5173
- Frontend (Vercel): https://kopilka-demo-rust.vercel.app
- API: https://kopilka.170.168.10.196.sslip.io/api/health
- Swagger: https://kopilka.170.168.10.196.sslip.io/api/docs

Frontend использует `/api` на своём домене. `vercel.json` проксирует `/api` на backend по HTTPS; страницы обслуживает Next.js App Router. SPA fallback на `index.html` удалён. Cookie — Secure, HttpOnly, SameSite=Strict. API разрешает изменения только с явно перечисленных источников.

Технический домен sslip.io зависит от внешнего DNS-сервиса. Для собственного домена измените nginx, сертификат, `ALLOWED_ORIGINS` и адрес прокси в `vercel.json`.

## Сервер

Ubuntu 24.04, PostgreSQL 16, nginx, Python virtualenv. Активные исходники: `/opt/kopilka/backend` (ссылка на backend выбранного релиза в `/opt/kopilka/releases/<commit>/backend`); зависимости: `/opt/kopilka/venv`; настройки: `/etc/kopilka/api.env`. Служба `kopilka-api` работает от системного пользователя `kopilka`, слушает только `127.0.0.1:8017` и автоматически запускается после перезагрузки. Миграции применяются перед запуском.

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

Из корня репозитория соберите архив только из закоммиченных файлов. `DEPLOY_SSH_KEY` указывает на SSH-ключ с доступом к серверу:

```sh
revision=$(git rev-parse --short=12 HEAD)
git archive --format=tar.gz --output="/tmp/kopilka-${revision}.tar.gz" HEAD backend deploy
scp -i "$DEPLOY_SSH_KEY" "/tmp/kopilka-${revision}.tar.gz" root@170.168.10.196:/tmp/
```

На сервере подготовьте отдельную папку `/opt/kopilka/releases/<commit>` и распакуйте архив в неё. Перед переключением:

1. Выполните `systemctl start kopilka-backup.service` и проверьте `Result=success`.
2. Сохраните текущий путь `readlink -f /opt/kopilka/backend` и копию `/etc/systemd/system/kopilka-api.service` в папке нового релиза.
3. Установите зависимости из нового `backend/requirements.lock` с `pip install --require-hashes`.
4. От пользователя `kopilka` с EnvironmentFile `/etc/kopilka/api.env` проверьте фабрику приложения и выполните `alembic check` из нового backend. Для этого подходит временная служба `systemd-run --wait --pipe --collect --uid=kopilka --gid=kopilka --property=EnvironmentFile=/etc/kopilka/api.env --working-directory=<новый backend> ...`.
5. Переключите ссылку `/opt/kopilka/backend` на новый backend через временную ссылку и `mv -Tf`.
6. Установите `deploy/kopilka-api.service` из нового релиза в `/etc/systemd/system/`, выполните `systemctl daemon-reload` и `systemctl restart kopilka-api`.
7. Проверьте `systemctl is-active kopilka-api`, `/api/health` напрямую и через домен frontend, затем сценарии приложения.

Служба запускается командой `uvicorn app.main:create_app --factory`. При ошибке запуска восстановите предыдущую ссылку и сохранённый unit, затем выполните daemon-reload и restart. Секреты остаются в `/etc/kopilka/api.env`, PostgreSQL — вне папок релизов.

Для первоначальной установки есть `setup-server.sh`. Повторный запуск перезаписывает nginx-конфигурацию; для обычного обновления используйте команды выше.

Публикация frontend из корня: `vercel deploy --prod`. `vercel.json` задаёт framework `nextjs`, сборку workspace и output `frontend/.next`; `/api` остаётся same-origin прокси к FastAPI. Для локальной проверки Vercel-сборки без публикации: `vercel build --prod`. Автоматическое размещение из GitHub отключено; текущий деплой загружен из локальной рабочей копии. Секреты и файлы бэкенда исключены из загрузки через `.vercelignore`. Production API разрешает основной адрес Vercel; новые домены нужно добавить в `/etc/kopilka/api.env` и перезапустить службу.

Приложение опубликовано в существующем режиме изолированного демо. Полноценная регистрация семей и реальная банковская интеграция в проекте отсутствуют.

## Опубликованный релиз · 2 ноября 2026

- Исходный commit: `f1f4745d6655631b7aa8b9d7ef38d16af2a442f3`.
- Vercel production deployment: `dpl_GAdmBb33Rb88jAY9vriBkhwYypD2`, основной адрес https://kopilka-demo-rust.vercel.app.
- API release: `/opt/kopilka/releases/f1f4745d6655/backend`; активная ссылка — `/opt/kopilka/backend`.
- Предыдущий backend: `/opt/kopilka/backend-before-f1f4745d6655`; предыдущий unit сохранён в `releases/f1f4745d6655/previous-api.service`.
- Перед обновлением создан PostgreSQL backup. Alembic не обнаружил изменений схемы, количество записей при переключении не изменилось.
