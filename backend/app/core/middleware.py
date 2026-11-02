from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, *, allowed_origins: list[str]):
        super().__init__(app)
        self._origins = frozenset(allowed_origins)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        origin = request.headers.get("origin")
        if request.method not in ("GET", "HEAD", "OPTIONS") and (
            (origin and origin not in self._origins) or request.headers.get("sec-fetch-site") == "cross-site"
        ):
            response = JSONResponse(
                status_code=403, content={"detail": "Этот источник запросов не разрешён."}
            )
        else:
            response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "same-origin"
        return response
