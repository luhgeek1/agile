# Проверка миграции на Next.js

2 ноября 2026. Next.js 16.4.4, React 19, App Router.

- Production Next.js build, ESLint, TypeScript: успешно.
- Unit: 19/19; FSD: 14/14.
- Полный Playwright на production Next.js: 22/22, включая WCAG A/AA, 360/390/430/768/1024/1440px и reduced motion.
- Docker standalone: сборка успешна, контейнер healthy; шесть проверок SSR, навигации, гидратации, 404 и денежных операций прошли на http://127.0.0.1:5173.
- Dev-сервер: HTTP 200 на 5174.
- Vercel: локальная production-сборка успешно создала `.vercel/output`, включая serverless-функции и favicon. Публикация не выполнялась.
- Главная 390/1440px просмотрена: дизайн сохранён.
- Context7 был недоступен; использованы официальные Next.js/Vercel docs и документация установленного Next.js из node_modules/next/dist/docs.

Во время первого прогона Vercel build перезаписал общий `.next`; тесты были остановлены. После создания чистой сборки последовательный полный прогон прошёл (22/22). Контейнерная сборка изолирована от локальной `.next`.
