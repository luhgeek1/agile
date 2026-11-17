# Размещение

## Адреса

- Локальная версия: http://127.0.0.1:5173
- Frontend на сервере: https://kopilka.170.168.10.196.sslip.io
- Вход по IP: http://170.168.10.196 (перенаправление на HTTPS-адрес выше)
- Frontend (Vercel, параллельный вход): https://kopilka-demo-rust.vercel.app
- API: https://kopilka.170.168.10.196.sslip.io/api/health
- Swagger: https://kopilka.170.168.10.196.sslip.io/api/docs

Оба frontend используют один backend через `/api` на своём домене. На Vercel `vercel.json` проксирует `/api` на backend по HTTPS, на сервере это делает nginx; страницы обслуживает Next.js App Router. Cookie — Secure, HttpOnly, SameSite=Strict. API разрешает изменения только с явно перечисленных источников. Демо-сессии привязаны к домену: открытие другого адреса создаёт отдельную копилку.

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

## Frontend на сервере

Next.js работает отдельной службой `kopilka-web` от пользователя `kopilka`,
слушает `127.0.0.1:3000` и запускается после перезагрузки. nginx направляет
`/api/` на FastAPI (`8017`), остальные запросы — на Next.js (`3000`).
Конфигурация TLS, созданная Certbot, сохраняется при обновлении nginx.

Используется standalone-сборка с `API_ORIGIN=http://127.0.0.1:8017`:

```sh
NEXT_STANDALONE=1 API_ORIGIN=http://127.0.0.1:8017 npm run build
cp -R frontend/.next/static frontend/.next/standalone/frontend/.next/static
cp -R frontend/public frontend/.next/standalone/frontend/public
tar -czf /tmp/kopilka-web.tar.gz -C frontend/.next/standalone .
```

Собирать и упаковывать следует на доверенной машине, затем передавать архив
на сервер по SSH и распаковывать в отдельный каталог релиза. Для Linux нужны
совместимые runtime-зависимости; текущие страницы не используют `next/image`.
Ссылка `/opt/kopilka/web` указывает на корень распакованной standalone-сборки.
Внутри нужны `frontend/server.js`, `frontend/.next/static`, `frontend/public`
и доступный пользователю `kopilka` каталог `frontend/.next/cache`.
Исходники приложения и секреты в публичный каталог nginx не помещаются.

Node.js 22.23.4 установлен из официального Linux x64 архива с проверкой SHA-256
в `/opt/kopilka/node-v22.23.4-linux-x64`; `/opt/kopilka/node` — ссылка на него.
Unit находится в `deploy/kopilka-web.service`. После переключения релиза:

```sh
systemctl restart kopilka-web
systemctl is-active kopilka-web kopilka-api nginx
curl --fail http://127.0.0.1:3000/healthz
curl --fail https://kopilka.170.168.10.196.sslip.io/api/health
```

Перед переключением сохраняйте старую ссылку и конфигурацию nginx.
При ошибке возвращайте их, проверяйте `nginx -t` и перезапускайте службу.
Публикация на Vercel остаётся независимой и не отключает frontend на сервере.

Для первоначальной установки есть `setup-server.sh`. Повторный запуск перезаписывает nginx-конфигурацию; для обычного обновления используйте команды выше.

Публикация frontend из корня: `vercel deploy --prod`. `vercel.json` задаёт framework `nextjs`, сборку workspace и output `frontend/.next`; `/api` остаётся same-origin прокси к FastAPI. Для локальной проверки Vercel-сборки без публикации: `vercel build --prod`. Автоматическое размещение из GitHub отключено; текущий деплой загружен из локальной рабочей копии. Секреты и файлы бэкенда исключены из загрузки через `.vercelignore`. Production API разрешает основной адрес Vercel; новые домены нужно добавить в `/etc/kopilka/api.env` и перезапустить службу.

Приложение опубликовано в существующем режиме изолированного демо. Полноценная регистрация семей и реальная банковская интеграция в проекте отсутствуют.

## Опубликованный релиз · 2 ноября 2026

- Исходный commit: `f1f4745d6655631b7aa8b9d7ef38d16af2a442f3`.
- Vercel production deployment: `dpl_GAdmBb33Rb88jAY9vriBkhwYypD2`, основной адрес https://kopilka-demo-rust.vercel.app.
- API release: `/opt/kopilka/releases/f1f4745d6655/backend`; активная ссылка — `/opt/kopilka/backend`.
- Предыдущий backend: `/opt/kopilka/backend-before-f1f4745d6655`; предыдущий unit сохранён в `releases/f1f4745d6655/previous-api.service`.
- Перед обновлением создан PostgreSQL backup. Alembic не обнаружил изменений схемы, количество записей при переключении не изменилось.

## Frontend на VDS · 11 ноября 2026

- Исходники frontend: `4fd62ff`; сборка Next.js и TypeScript прошли локально.
- Новый frontend: `/opt/kopilka/releases/4fd62ff-web-20261111/web`;
  активная ссылка — `/opt/kopilka/web`. Backend остался на существующем релизе.
- Установлена и включена служба `kopilka-web`; nginx проксирует страницы на неё.
  Прежняя конфигурация сохранена в `4fd62ff-web-20261111/nginx.previous.conf`.
- Перед изменением выполнен backup PostgreSQL (`Result=success`).
- HTTP-проверки обоих доменов прошли: восемь страниц, JS/CSS, health,
  Secure/HttpOnly cookie, запись и повторное чтение операции, идемпотентность,
  восстановление созданного проверкой демо. Проверен переход по IP на HTTPS.
- Frontend на Vercel продолжает работать без перепубликации.

## Vercel · 16 ноября 2026

- Опубликован frontend из commit `5cca749a0f4b21a686c9d6635774ecf3b23deadd`:
  геймификация, новые экраны цели, заданий и истории, анимации и адаптив.
- Deployment: `dpl_FCBoWnhBZmmZpwZMqHDnwdZGXpJX`, статус `Ready`, target `production`.
- Основной адрес: https://kopilka-demo-rust.vercel.app.
- Неизменяемый адрес релиза: https://kopilka-demo-i1vg0ez44-luhgeek1s-projects.vercel.app.
- На опубликованном сайте проверены три обновлённых экрана, мастерская решений,
  фильтры, запись пополнения и чтение после reload, мобильная ширина 390px.
  Ошибок страницы и HTTP-ответов 4xx/5xx в проверяемом сценарии нет.
  Созданное проверкой изолированное демо восстановлено; cookie сохраняет
  атрибуты Secure, HttpOnly и SameSite=Strict.
- При публикации Vercel backend и frontend на VDS не менялись.
  Последующее обновление VDS описано ниже.

## Frontend на VDS · 16 ноября 2026

- Исходный commit: `ec85364783937f4a41f19fef5044fe99ea842e65`.
- Сборка выполнена локально в Docker для Linux x86_64, Node.js 22.23.4,
  с `NEXT_STANDALONE=1` и `API_ORIGIN=http://127.0.0.1:8017`.
- Активный frontend: `/opt/kopilka/releases/ec85364-web-20261116/web`;
  build ID: `byObc71JEd8hxQrYP0uNQ`.
- Предыдущий frontend: `/opt/kopilka/releases/4fd62ff-web-20261111/web`.
  Его путь, systemd unit и архив конфигурации nginx сохранены в новом релизе.
- Перед обновлением PostgreSQL backup завершился с `Result=success`.
  Кандидат проверен на `127.0.0.1:3001`: health, API, страницы и 20 static assets.
  Затем ссылка `/opt/kopilka/web` переключена атомарно и перезапущен `kopilka-web`.
- Backend не перезапускался; его PID и ссылка релиза остались прежними.
  Конфигурация nginx и настройки API не менялись.
- На https://kopilka.170.168.10.196.sslip.io проверены пополнение и выполнение
  задания с сохранением после reload, история, мастерская решений и три
  обновлённых экрана при 390px. Ошибок страницы и HTTP 4xx/5xx нет.
  Созданное проверкой изолированное демо восстановлено.
- `kopilka-web`, `kopilka-api` и nginx активны; у нового frontend `NRestarts=0`.
  Для отката можно вернуть `/opt/kopilka/web` на предыдущий frontend через
  временную ссылку и `mv -Tf`, затем перезапустить `kopilka-web`.

## Визуальные исправления · 17 ноября 2026

- Frontend из commit `ae82695`: отдельная строка для входа в игру,
  кнопка «Открыть карту игры», отступы текста от стрелок карусели.
- Vercel: `dpl_FGwJL2rKpSALVCQqLa2Kbk6Kz86e`, статус `Ready`, production;
  неизменяемый адрес: https://kopilka-demo-g1pfkw92u-luhgeek1s-projects.vercel.app.
- VDS: `/opt/kopilka/releases/ae82695-web-20261117/web`,
  build ID `OpZ4ND7jQaUb6SSyEHmFF`. Предыдущий релиз — `ec85364-web-20261116`.
- Linux x86_64 сборка подготовлена в Docker. Из-за медленной передачи отправлен
  архив frontend; неизменившиеся `node_modules` скопированы из предыдущего релиза.
  Перед этим локальное сравнение каталогов зависимостей обеих сборок не выявило различий.
- Backup PostgreSQL успешен. SHA-256 архива проверен. Кандидат на порту 3001
  прошёл проверку 9 маршрутов и 22 файлов; затем ссылка переключена атомарно.
  Backend и nginx не менялись, `kopilka-web` active, `NRestarts=0`.
- На каждом публичном адресе прошли 3 проверки расположения текста и переходов
  на карту, а также сценарий записи пополнения, выполнения задания, истории,
  reload, игры и мобильной ширины 390px. Ошибок страницы и HTTP 4xx/5xx нет;
  созданные проверкой демо восстановлены.
- Подробности и снимки: [визуальная проверка](../artifacts/visual-fixes/verification.md).
