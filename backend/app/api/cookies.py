from fastapi import Response

from app.core.config import Settings
from app.service.parent_access import ACCESS_AGE_SECONDS

COOKIE = "kopilka_demo"
PARENT_COOKIE = "kopilka_parent"


def set_demo_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie(
        COOKIE,
        token,
        max_age=30 * 24 * 60 * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="strict",
        path="/api",
    )


def set_parent_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie(
        PARENT_COOKIE,
        token,
        max_age=ACCESS_AGE_SECONDS,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="strict",
        path="/api",
    )


def clear_parent_cookie(response: Response, settings: Settings) -> None:
    response.delete_cookie(
        PARENT_COOKIE, path="/api", httponly=True, secure=settings.cookie_secure, samesite="strict"
    )
