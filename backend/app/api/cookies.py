from fastapi import Response

from app.core.config import Settings

COOKIE = "kopilka_demo"


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
