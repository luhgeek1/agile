.PHONY: start rebuild dev stop check test-backend

start:
	docker compose up -d --build --wait

rebuild:
	docker compose build --no-cache api web
	docker compose up -d --wait

dev:
	docker compose stop web
	docker compose up -d --build --wait db api
	npm run dev

stop:
	docker compose stop

check:
	npm run lint
	npm run typecheck
	npm test
	npm run build
	cd backend && uv run ruff check app migrations tests && uv run pytest -q

test-backend:
	cd backend && uv run pytest -q
