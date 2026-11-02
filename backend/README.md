# Backend «Коплю — Трачу — Помогаю»

Архитектура адаптирована из [RoboMera/backend](https://github.com/luhgeek1/RoboMera/tree/4ed6737c1a66115d308ba80db83357779f9d5b52/backend), состояние main на 2 ноября 2026.

## Слои

```text
app/
  main.py                 create_app: сборка приложения и lifespan
  core/                   настройки, ошибки, HTTP middleware и обработчики ошибок
  api/
    deps.py               ресурсы приложения, Unit of Work, текущая семья
    cookies.py            HTTP cookie демо-сессии
    schemas/              Pydantic-модели запросов и ответов, преобразование в domain
    v1/                   тонкие роутеры по сценариям
  service/                демо, снимок состояния, деньги, цель, задания, отзывы
  domain/                 типы и команды, расчёт прогресса, учебный контент
  db/
    base.py               SQLAlchemy metadata
    session.py            Database, engine и фабрика сессий
    models/               ORM-модели по предметным областям
    repositories/         SQL, блокировки и атомарные изменения остатков
    uow.py                единая транзакция и репозитории
  seeds/runner.py          заполнение примера внутри текущей транзакции
migrations/               существующая история Alembic
```

Роутер валидирует HTTP-запрос, получает зависимости и вызывает сервис. Pydantic-модель преобразует входные данные в неизменяемую dataclass-команду. Сервис выполняет сценарий через Unit of Work и репозитории. `domain` не зависит от FastAPI, Pydantic, ORM или API; `service` не зависит от HTTP и API-схем. Ошибки сервисов описаны в `core/errors.py`, их HTTP-представление создаётся в `core/handlers.py`.

SQL находится в `db/repositories`. Отдельных commit в сервисах, роутерах, репозиториях и seed нет. `api/deps.py` открывает один Unit of Work на запрос и выполняет commit до отправки ответа (`Depends(scope="function")`). Ошибка приводит к rollback и закрытию сессии. Ошибка commit возвращает 503; cookie для несохранённой демо-сессии не отправляется.

`create_app(settings=None, *, database=None)` создаёт независимое приложение. Settings хранятся в `app.state.settings`, Database — в `app.state.db`. Engine создаётся при старте lifespan и освобождается при остановке. В тестах можно передать Database с изолированным engine; внедрённым ресурсом управляет вызывающая сторона.

## Адаптация RoboMera

Взяты структура `core/api/service/domain/db`, фабрика приложения, lifespan, прикладные сервисы с командами, репозитории и Unit of Work. Для текущего проекта сохранён синхронный SQLAlchemy: FastAPI выполняет обычные `def`-обработчики в thread pool, PostgreSQL использует psycopg, локальные тесты поддерживают SQLite. Существующий контракт остаётся на `/api`; имя `api/v1` обозначает внутреннюю версию реализации. Названия таблиц, ограничения и миграции сохранены.

Изоляция семьи определяется серверной cookie. Запись денег, проверка идемпотентности, изменение обоих отсеков при переносе и сброс сериализуются блокировкой семьи. Проверки остатка и верхнего лимита остаются условными SQL UPDATE. Снимок состояния использует shared row lock в PostgreSQL. Прогресс цели вычисляется из фактического остатка «Коплю».

## Запуск

Из корня репозитория:

```sh
docker compose up -d --build --wait
```

Или из `backend/` с API на компьютере:

```sh
uv sync --frozen
# Настройки: .env.example → .env
uv run alembic upgrade head
uv run uvicorn app.main:create_app --factory --reload --host 127.0.0.1 --port 8017
```

Health: `/api/health`, Swagger: `/api/docs`, OpenAPI: `/api/openapi.json`.

## Проверки

Из `backend/`:

```sh
uv run ruff check app migrations tests
uv run ruff format --check app migrations tests
uv run pytest -q
TEST_DATABASE_URL=postgresql+psycopg://kopilka:local-demo-only@127.0.0.1:54329/kopilka uv run pytest -q
uv run alembic check
```

51 тест проверяет контракты и валидацию, изоляцию сессий, конкурирующие списания, идемпотентность, откат переноса, domain, Unit of Work, фабрику и границы слоёв. PostgreSQL-тесты создают отдельную схему на тест и удаляют её после завершения. Браузерная проверка всего приложения из корня: `npm run test:e2e`.
