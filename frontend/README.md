# Frontend

React-приложение «Коплю — Трачу — Помогаю». API и схема БД находятся в соседнем `backend/`; общие команды запуска — в [README репозитория](../README.md).

## Работа с проектом

Установить зависимости из корня репозитория:

```sh
npm ci
```

Команды ниже работают из корня и из `frontend/`:

```sh
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
npm run test:e2e
```

Vite по умолчанию слушает `127.0.0.1:5173`, preview — `127.0.0.1:4173`. В обоих режимах `/api` проксируется на `127.0.0.1:8017`; API нужно запустить отдельно. Сборка находится в `frontend/dist`. Параметры CLI передаются обычным способом: `npm run dev -- --port 5174`. При смене порта добавьте новый origin в `ALLOWED_ORIGINS` локального API.

`package.json` фронтенда владеет зависимостями; единый `package-lock.json` находится в корне npm workspace. Чтобы добавить пакет из корня: `npm install <package> --workspace frontend`. Docker собирается из корня: `docker build -f frontend/Dockerfile .` или через общий Compose.

## FSD

Слои следуют [Feature-Sliced Design](https://feature-sliced.design/docs/reference/layers). Каждый слайс содержит сегменты `ui`, `model`, `api` по необходимости.

| Слой       | Ответственность                                                                        |
| ---------- | -------------------------------------------------------------------------------------- |
| `app`      | Маршруты, QueryClient, Router, Motion, уведомления, ErrorBoundary, глобальные стили    |
| `pages`    | Отдельный слайс каждого экрана, композиция виджетов и сценарии конкретной страницы     |
| `widgets`  | Общий `product-shell` с навигацией и диалогами, карусель заданий, методическая заметка |
| `features` | `record-operation`, `edit-goal`, `complete-activity`: формы, валидация, сохранение     |
| `entities` | `wallet`, `goal`, `transaction`, `activity`, `demo-session`: данные и их представление |
| `shared`   | HTTP-транспорт, контракты API, переиспользуемые UI-компоненты, утилиты денег           |

Зависимости направлены вниз: `app → pages → widgets → features → entities → shared`. Переходить через слой можно: например, страница может напрямую использовать сущность. Слайсы одного слоя изолированы. `app` и `shared` состоят из сегментов без изоляции слайсов.

Внешние импорты слайса проходят через его [публичный API](https://feature-sliced.design/docs/reference/public-api), внутри используются относительные пути:

```ts
import { GoalCard } from '@/entities/goal'
import { AddButton } from '@/features/record-operation'
import { Button } from '@/shared/ui'
```

Алиас `@` указывает на `frontend/src` и настроен одинаково для TypeScript, Vite и Vitest. Правило `fsd/boundaries` в ESLint проверяет направление зависимостей, изоляцию слайсов и запрет доступа к внутренним файлам другого слайса. Оно проверяет также реэкспорты, относительные пути и динамические импорты со строковым путём.

Две явные связи между сущностями оформлены через `entities/wallet/@x`: карточке задания нужна иконка отсека, строке истории — его название. Эти точки входа доступны только слайсу, названному в `@x/<slice>`. Остальной код использует обычный публичный API `wallet`.

`shared/api/contracts.ts` описывает только формат серверных DTO. Подписи отсеков находятся в модели `wallet`, загрузка состояния — в `demo-session`, действия пользователя — в `features` или использующей их странице. Типы сущностей доступны из публичных API соответствующих слайсов. Состояние layout и функции открытия диалогов находятся в `widgets/product-shell/model/context.ts`; страницы получают их через `useProduct`, не импортируя слой `app`.

Глобальные стили пока остаются одним файлом `app/styles/index.css`, чтобы перенос архитектуры сохранил оформление. Общие иллюстрации разделены по смыслу: `Jar` принадлежит `wallet`, `GoalArt` — `goal`, логотип — `shared/ui`.

## Проверки

`npm test` запускает unit-тесты обработки денег и 14 проверок правила FSD. Браузерные сценарии лежат в `frontend/e2e`, конфигурация — в `playwright.config.ts`. Они требуют работающих frontend и API. Для проверки production-сборки:

```sh
# Терминал 1; API уже работает на 8017
npm run build
npm run preview

# Терминал 2
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 npm run test:e2e
```

Отчёт Playwright находится в `frontend/playwright-report`, диагностические файлы — в `frontend/test-results`. Скриншоты сценариев по умолчанию сохраняются в `artifacts/qa` корня репозитория; абсолютный `PLAYWRIGHT_ARTIFACTS_DIR` позволяет выбрать другую папку.
