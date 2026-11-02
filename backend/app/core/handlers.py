import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.errors import DomainError

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def domain_error(_: Request, exc: DomainError):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(RequestValidationError)
    async def invalid_input(_: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422, content={"detail": "Проверьте поля: сумму, дату и выбранные значения."}
        )

    @app.exception_handler(SQLAlchemyError)
    async def database_error(_: Request, exc: SQLAlchemyError):
        logger.error("Database request failed", exc_info=exc)
        return JSONResponse(
            status_code=503, content={"detail": "Не удалось сохранить данные. Попробуйте ещё раз."}
        )
