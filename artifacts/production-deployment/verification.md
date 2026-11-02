# Production deployment · 2 ноября 2026

Source commit: f1f4745d6655631b7aa8b9d7ef38d16af2a442f3.

- Frontend: https://kopilka-demo-rust.vercel.app.
- Vercel deployment: dpl_GAdmBb33Rb88jAY9vriBkhwYypD2, production, Ready.
- Cloud build: Next.js 16.4.4, App Router, successful.
- API: https://kopilka.170.168.10.196.sslip.io/api/health.
- API release: /opt/kopilka/releases/f1f4745d6655/backend, active through /opt/kopilka/backend.
- API starts via app.main:create_app --factory; systemd service active.
- PostgreSQL backup completed before activation (Result=success).
- Preflight factory/OpenAPI validation passed as the service user with production configuration.
- Alembic check: No new upgrade operations detected.
- Database row counts unchanged across API activation.
- Previous backend and systemd unit preserved for rollback.
- Public OpenAPI has the new typed StateOut and all nine API paths.
- API health via the production frontend: status=ok.
- Six Playwright production checks passed: server-rendered welcome without JavaScript, client navigation/titles/URL filters, hydration with dismissed notice, health/404, deposit/reload/edit goal/history, validation/overdraft prevention/transfer/help expense.
