# Коплю — Трачу — Помогаю

Рабочая первая версия образовательной копилки для детей 6–10 лет и родителей. Цифровые записи продолжают практику с физической «Умной копилкой» НЦФГ: копить на мечту, выбирать расходы и помогать другим.

В этой версии доступны **только изолированные демонстрационные пространства**. Платежей, переводов настоящих денег и подключения банков нет. Продуктовые решения, иллюстрации и образовательные тексты предложены командой и требуют согласования с НЦФГ.

## Быстрый запуск с PostgreSQL

Нужен работающий Docker с Compose. Из корня репозитория:

```sh
docker compose up -d --build --wait
```

Открыть **http://127.0.0.1:5173** и нажать «Посмотреть демо». Frontend, API и PostgreSQL работают в фоне; закрытие терминала их не выключает. Для этого режима Node.js на компьютере не требуется. Альтернатива команде выше — `make start`.

Полная пересборка frontend и API без кэша, с сохранением данных: `make rebuild`.

- Интерфейс: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:8017/api/health`
- OpenAPI / Swagger: `http://127.0.0.1:8017/api/docs`
- PostgreSQL: `127.0.0.1:54329`, база и пользователь `kopilka`, локальный пароль `local-demo-only`.

Compose автоматически применяет Alembic-миграции перед запуском API. Next.js раздаёт frontend, направляет `/api/` в backend и обслуживает маршруты `/app/...` через App Router. Начальные данные создаются при входе в новую демо-сессию. Порты контейнеров опубликованы только на loopback. Не смешивайте `localhost` и `127.0.0.1` при демонстрации: cookie привязана к адресу браузера.

Чтобы остановить: `docker compose stop`. Данные остаются в томе `kopilka_pgdata`. Не удаляйте этот том для обычного сброса демо.

Для разработки с горячим обновлением нужны Node.js 22.12+ и локальные зависимости: `npm ci`, затем `make dev`. Эта команда останавливает контейнер `web`, освобождает порт 5173 и запускает Next.js в терминале. После завершения разработки вернуться к фоновому режиму можно командой `make start`.

## Запуск без Docker

Для полностью локальной версии с файловой SQLite нужны Python 3.11+ и [uv](https://docs.astral.sh/uv/). Терминал 1:

```sh
cd backend
uv sync --frozen
DATABASE_URL=sqlite:///./kopilka.db uv run alembic upgrade head
DATABASE_URL=sqlite:///./kopilka.db uv run uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8017
```

В терминале 2 из корня:

```sh
npm ci
npm run dev
```

SQLite — дополнительный вариант локального запуска. Основной путь и браузерная проверка используют PostgreSQL. Конкурентные изменения проверены на обеих СУБД.

Для разработки API на компьютере с PostgreSQL из Compose:

```sh
docker compose up -d db
cp backend/.env.example backend/.env
cd backend
uv sync --frozen
uv run alembic upgrade head
uv run uvicorn app.main:create_app --factory --reload --host 127.0.0.1 --port 8017
```

Не запускайте API в контейнере и на компьютере одновременно на одном порту.

## Возможности

- Три отсека: «Коплю», «Трачу», «Помогаю»; суммы в рублях и копейках.
- Пополнение, использование и атомарный перенос денег между отсеками, дата и заметка.
- Проверка остатка на сервере; защита от двойной записи одной операции.
- Создание и редактирование одной текущей цели; прогресс из фактического баланса «Коплю».
- История с фильтрами по отсеку/действию и постраничной загрузкой.
- Шесть заданий с тремя конкретными шагами и пояснением результата. На главной — циклическое листание стрелками, клавиатурой и свайпом; дата выполнения сохраняется. Задания не изменяют деньги.
- Родительский экран: прогресс, последние действия, выполненные задания, четыре темы для семейных разговоров.
- Валидируемая обратная связь взрослого: полезность, сложность, комментарий. Сохранение и выгрузка JSON на сервере; автоматической отправки в НЦФГ нет.
- Справка, восстановление примера и начало с пустой копилкой с подтверждением.
- Адаптивный интерфейс, нижняя мобильная навигация, доступные диалоги, уведомления и reduced motion.

## Демо и данные

Каждый новый браузер получает отдельную семью. Сессия — случайный непрозрачный токен в `HttpOnly`, `SameSite=Strict` cookie; на сервере хранится SHA-256 токена. Срок cookie и сессии — 30 дней. Токены не передаются в URL и не хранятся в localStorage. Повторное нажатие входа использует текущую действительную сессию.

Содержимое стартового примера: «Коплю» 1 250 ₽, «Трачу» 250 ₽, «Помогаю» 200 ₽; цель «Мой первый велосипед» 2 500 ₽; шесть операций и одно выполненное задание.

Сбросить **только своё** демо можно на `/app/settings`:

1. «Сбросить демо» возвращает стартовый пример.
2. «Начать с пустой копилкой» удаляет записи, цель, отметки и отзывы этой сессии.
3. Оба действия требуют подтверждения. Другие сессии не затрагиваются.

Обновление страницы и перезапуск сервера сохраняют данные. Удаление cookie или другой браузер создают отдельную копилку; восстановления доступа через почту в демо нет. Истёкшие записи автоматически не удаляются — это отдельная задача перед размещением пилота.

Родительская зона — разграничение интерфейса внутри демо. Это не полноценная авторизация взрослых. Не вводите реальные персональные данные детей. Нет регистрации реальных семей, внешней аналитики, AI или камеры.

## Стек и структура

Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, компоненты по подходу shadcn/ui на Radix UI, Motion, Lucide, TanStack Query, React Hook Form, Zod, Sonner. Nunito и Nunito Sans поставляются локально через Fontsource, внешние шрифтовые сервисы не нужны.

Backend: FastAPI (фабрика приложения), Pydantic 2, SQLAlchemy 2, Alembic, PostgreSQL 17; дополнительная поддержка SQLite. Версии зафиксированы в `package-lock.json`, `backend/uv.lock` и экспортированном `backend/requirements.lock` с хешами для контейнера.

```text
frontend/
  src/
    app/                 маршруты, провайдеры, глобальные стили, обработка ошибок
    views/               welcome, home, goals, history, activities, parent, feedback, settings
    widgets/             общий каркас продукта, карусель, методическая заметка
    features/            запись операции, редактирование цели, выполнение задания
    entities/            wallet, goal, transaction, activity, demo-session
    shared/              HTTP-клиент и DTO, UI primitives, форматирование денег
  e2e/                   Playwright: сценарии, размеры экрана, клавиатура, axe
  config/eslint/         проверка границ FSD и её тесты
  public/                статические файлы
  Dockerfile             production-сборка frontend
  next.config.ts         standalone-сборка и прокси API
  package.json           зависимости и команды frontend
  *config*               Next.js, PostCSS, TypeScript, ESLint, Vitest, Playwright
backend/
  app/main.py            фабрика FastAPI и жизненный цикл ресурсов
  app/core/              настройки, ошибки, middleware
  app/api/v1/            тонкие HTTP-роутеры, контракт /api
  app/api/schemas/       Pydantic-входы и типизированные ответы
  app/service/           прикладные сценарии через Unit of Work
  app/domain/            независимые типы, команды, расчёты и учебный контент
  app/db/                ORM-модели, репозитории, сессии и Unit of Work
  app/seeds/             стартовые данные демо
  migrations/            версионированная схема Alembic
  tests/                 API, изоляция, инварианты, конкурентные операции
  .env.example           пример настроек локального API
compose.yaml             frontend + API + PostgreSQL
Makefile                 общие команды
package.json             npm workspace и команды из корня
package-lock.json        единый lock frontend workspace
artifacts/qa/            скриншоты визуальной проверки
```

Frontend организован по [Feature-Sliced Design](https://feature-sliced.design/docs/reference/layers): `app → views → widgets → features → entities → shared`. Слайсы импортируют нижние слои через публичные `index.ts`; исключения между сущностями явно оформлены через `@x`. ESLint проверяет направление зависимостей, изоляцию слайсов и публичные API, включая относительные импорты. Подробности и примеры: [frontend/README.md](frontend/README.md).

Зависимости фронтенда и его конфигурация находятся в `frontend`. Установка остаётся из корня: `npm ci`. Команды `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm run typecheck`, `npm test` и `npm run test:e2e` делегируются workspace; они также работают из `frontend`. Сборка создаётся в `frontend/.next`; `npm run start` запускает production-сервер на 5173, `npm run preview` — на 4173. Это серверное Next.js-приложение, отдельного `dist/index.html` больше нет.

Деньги хранятся целыми копейками в `BIGINT`. Лимит операции/цели — 1 000 000 ₽, отсека — 10 000 000 ₽. Семейная блокировка сериализует изменения и сброс. Условное списание и `CHECK` в БД не допускают отрицательного баланса. Перенос, обновление остатков и запись истории коммитятся вместе. Клиент не передаёт идентификатор семьи: область доступа определяется серверной сессией.

Архитектура backend адаптирована из RoboMera: `api → service → domain`, SQL в репозиториях, единая транзакция на запрос через Unit of Work. Подробности и правила зависимостей: [backend/README.md](backend/README.md).

## Тестирование

Frontend из корня (unit-тесты и 14 проверок архитектурных границ):

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

Backend (SQLite, изолированная временная БД каждого теста):

```sh
cd backend
uv sync --frozen
uv run ruff check app migrations tests
uv run pytest -q
```

Тот же набор на PostgreSQL (Compose db должен работать):

```sh
cd backend
TEST_DATABASE_URL=postgresql+psycopg://kopilka:local-demo-only@127.0.0.1:54329/kopilka uv run pytest -q
```

Тесты PostgreSQL создают собственную случайную схему для каждого теста и удаляют только её. Демо-данные приложения не сбрасываются.

Браузерные тесты, при работающих frontend и backend:

```sh
npm exec --workspace frontend -- playwright install chromium
npm run test:e2e
```

Playwright создаёт отдельные демо-сессии. Для записи скриншотов в другую папку задайте абсолютный путь в `PLAYWRIGHT_ARTIFACTS_DIR`. Скриншоты ключевых страниц 390/1440 px сохраняются в `artifacts/qa`; отчёт — `frontend/playwright-report/index.html`. В сценариях проверяются все семь страниц на 360/390/430/768/1024/1440 px, операции, формы, reload, ошибки API, пустые состояния и клавиатура. Axe проверяет основные страницы и диалог на 390/1440 px. Это автоматическая проверка доступности, не сертификат WCAG и не тест на физических устройствах.

## Миграции и сборка

```sh
docker compose exec api alembic current
docker compose exec api alembic check
```

При изменении моделей (в `backend`, с настроенной `.env`):

```sh
uv run alembic revision --autogenerate -m "Describe the change"
uv run alembic upgrade head
```

Просматривайте созданную миграцию перед применением. При изменении Python-зависимостей обновляйте lock и экспорт:

```sh
uv lock
uv export --frozen --no-dev --no-emit-project --output-file requirements.lock > /dev/null
```

Для локального просмотра production-сборки из корня:

```sh
npm run build
npm run preview
```

Открыть `http://127.0.0.1:4173`. API по-прежнему должен работать на 8017. Публичное демо: https://kopilka-demo-rust.vercel.app. Настройки Vercel, HTTPS API, службы и резервных копий описаны в [deploy/README.md](deploy/README.md). Для реальных семей требуется отдельное проектирование авторизации/согласий. Значения локального Compose не являются production-секретами.

Браузерные тесты можно прогнать и на собранном frontend: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 npm run test:e2e`.

Результаты фактической проверки и ограничения: [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md). Исходные требования: [CONTEXT.md](CONTEXT.md), [DESIGN.md](DESIGN.md).
