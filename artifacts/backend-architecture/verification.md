# Проверка архитектуры backend

2 ноября 2026. Источник: RoboMera/backend, commit `4ed6737c1a66115d308ba80db83357779f9d5b52`.

- Слои `core`, `api/schemas`, `api/v1`, `service`, `domain`, `db/models`, `db/repositories`, `db/uow`, `seeds`.
- `create_app` и lifespan; ресурсы принадлежат экземпляру приложения.
- Unit of Work фиксирует транзакцию до HTTP-ответа, при ошибках выполняет rollback.
- Синхронный SQLAlchemy сохранён для PostgreSQL/SQLite; границы архитектуры взяты из RoboMera.
- Ruff lint и format: успешно.
- Pytest SQLite: 51/51.
- Pytest PostgreSQL: 51/51, каждый тест в собственной временной схеме.
- Alembic check на существующей PostgreSQL: No new upgrade operations detected.
- Сравнение OpenAPI с исходной схемой: те же пути, методы, operationIds, параметры, requestBody, наборы статусов и четыре входные модели TransactionIn/GoalIn/FeedbackIn/ResetIn. Добавлены типизированные ответы.
- Playwright через обновлённый API в Docker: 22/22.
- Контейнер API healthy; /api/health через Next.js возвращает status=ok.

Новые проверки покрывают чистоту зависимостей слоёв, единую границу транзакций, расчёт прогресса, rollback разных репозиториев, отсутствие неявного commit, жизненный цикл Database, изоляцию Settings и ошибку commit без выдачи cookie или утечки деталей БД.
