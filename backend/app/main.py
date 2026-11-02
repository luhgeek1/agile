from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import Settings, get_settings
from app.core.handlers import register_exception_handlers
from app.core.middleware import SecurityHeadersMiddleware
from app.db.session import Database


def create_app(settings: Settings | None = None, *, database: Database | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        app.state.db = database if database is not None else Database(settings)
        try:
            yield
        finally:
            if database is None:
                app.state.db.dispose()

    app = FastAPI(
        title="Коплю — Трачу — Помогаю",
        version="1.0.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )
    app.state.settings = settings
    register_exception_handlers(app)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type"],
    )
    app.add_middleware(SecurityHeadersMiddleware, allowed_origins=settings.cors_origins)
    app.include_router(api_router)
    return app
