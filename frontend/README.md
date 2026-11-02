# Frontend

Приложение на Next.js 16 (App Router) и React 19 «Коплю — Трачу — Помогаю». API и схема БД находятся в соседнем `backend/`; общие команды запуска — в [README репозитория](../README.md).

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
npm run start
npm run preview
npm run test:e2e
```

Next.js dev и `npm run start` слушают `127.0.0.1:5173`, preview — `127.0.0.1:4173`. `/api` проксируется на `127.0.0.1:8017`; API нужно запустить отдельно. `API_ORIGIN` меняет адрес backend при сборке (`API_ORIGIN=https://example.com npm run build`); это серверная переменная, она не публикуется как `NEXT_PUBLIC_*`. После её изменения нужна новая сборка. Для разработки переменную можно задать при запуске dev.

Production-сборка находится в `frontend/.next`, при `NEXT_STANDALONE=1 npm run build` дополнительно создаётся standalone-сервер `frontend/.next/standalone/frontend/server.js` (этот режим включает Docker). Docker копирует сервер, static и public в нужные директории и запускает Node.js от пользователя `node`. Для контейнера backend по умолчанию доступен как `http://api:8000`; build argument `API_ORIGIN` меняет этот адрес.

Параметры CLI передаются обычным способом: `npm run dev -- --port 5174`. При смене порта добавьте новый origin в `ALLOWED_ORIGINS` локального API. `frontend/dist/index.html` больше не является входной точкой; корневой документ — `src/app/layout.tsx`.

`package.json` фронтенда владеет зависимостями; единый `package-lock.json` находится в корне npm workspace. Чтобы добавить пакет из корня: `npm install <package> --workspace frontend`. Docker собирается из корня: `docker build -f frontend/Dockerfile .` или через общий Compose.

## Маршруты и границы клиента

`src/app` содержит настоящие маршруты App Router: `/`, `/app`, `/app/goals`, `/app/activities`, `/app/transactions`, `/app/parent`, `/app/parent/feedback`, `/app/settings`. Корневой layout задаёт русский язык, локальные шрифты, metadata и viewport. Вложенный `/app/layout.tsx` сохраняет навигацию, состояние открытых диалогов и общий React Context между страницами. Страницы имеют собственные title, неизвестные пути возвращают 404, `/healthz` используется Docker.

Маршрутные файлы остаются Server Components; интерактивные экраны и провайдеры явно помечены `use client`. QueryClient создаётся отдельно для каждого экземпляра провайдера. Приватные данные загружаются через cookie после гидратации и не попадают в статическую сборку. История читает URL через `useSearchParams` внутри `Suspense`; фильтры поддерживают прямые ссылки и браузерную историю.

## FSD

Слой экранов называется `views`, поскольку директория `src/pages` зарезервирована Next.js под Pages Router. Это тот же уровень FSD Pages; правила изоляции сохранены.

Слои следуют [Feature-Sliced Design](https://feature-sliced.design/docs/reference/layers). Каждый слайс содержит сегменты `ui`, `model`, `api` по необходимости.

| Слой       | Ответственность                                                                        |
| ---------- | -------------------------------------------------------------------------------------- |
| `app`      | Маршруты, QueryClient, Router, Motion, уведомления, ErrorBoundary, глобальные стили    |
| `views`    | Отдельный слайс каждого экрана, композиция виджетов и сценарии конкретной страницы     |
| `widgets`  | Общий `product-shell` с навигацией и диалогами, карусель заданий, методическая заметка |
| `features` | `record-operation`, `edit-goal`, `complete-activity`: формы, валидация, сохранение     |
| `entities` | `wallet`, `goal`, `transaction`, `activity`, `demo-session`: данные и их представление |
| `shared`   | HTTP-транспорт, контракты API, переиспользуемые UI-компоненты, утилиты денег           |

Зависимости направлены вниз: `app → views → widgets → features → entities → shared`. Переходить через слой можно: например, страница может напрямую использовать сущность. Слайсы одного слоя изолированы. `app` и `shared` состоят из сегментов без изоляции слайсов.

Внешние импорты слайса проходят через его [публичный API](https://feature-sliced.design/docs/reference/public-api), внутри используются относительные пути:

```ts
import { GoalCard } from '@/entities/goal'
import { AddButton } from '@/features/record-operation'
import { Button } from '@/shared/ui'
```

Алиас `@` указывает на `frontend/src` и настроен одинаково для TypeScript, Next.js и Vitest. Правило `fsd/boundaries` в ESLint проверяет направление зависимостей, изоляцию слайсов и запрет доступа к внутренним файлам другого слайса. Оно проверяет также реэкспорты, относительные пути и динамические импорты со строковым путём.

Две явные связи между сущностями оформлены через `entities/wallet/@x`: карточке задания нужна иконка отсека, строке истории — его название. Эти точки входа доступны только слайсу, названному в `@x/<slice>`. Остальной код использует обычный публичный API `wallet`.

`shared/api/contracts.ts` описывает только формат серверных DTO. Подписи отсеков находятся в модели `wallet`, загрузка состояния — в `demo-session`, действия пользователя — в `features` или использующей их странице. Типы сущностей доступны из публичных API соответствующих слайсов. Состояние layout и функции открытия диалогов находятся в `widgets/product-shell/model/context.ts`; страницы получают их через `useProduct`, не импортируя слой `app`.

Глобальные стили подключены из корневого `app/layout.tsx`: `app/styles/index.css` и `app/styles/child-experience.css`. Общие иллюстрации разделены по смыслу: `Jar` принадлежит `wallet`, `GoalArt` — `goal`, логотип — `shared/ui`.

## Проверки

`npm test` запускает 19 unit-тестов обработки денег и 14 проверок правила FSD. Vite и React-плагин остаются только инструментами Vitest; приложение собирается и запускается Next.js. 22 браузерных сценария, включая серверный HTML, навигацию Next.js, URL-фильтры, 404 и гидратацию, лежат в `frontend/e2e`, конфигурация — в `playwright.config.ts`. Они требуют работающих frontend и API. Для проверки production-сборки:

```sh
# Терминал 1; API уже работает на 8017
npm run build
npm run preview

# Терминал 2
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 npm run test:e2e
```

Отчёт Playwright находится в `frontend/playwright-report`, диагностические файлы — в `frontend/test-results`. Скриншоты сценариев по умолчанию сохраняются в `artifacts/qa` корня репозитория; абсолютный `PLAYWRIGHT_ARTIFACTS_DIR` позволяет выбрать другую папку.
