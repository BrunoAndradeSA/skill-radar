from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adiciona cabeçalhos de segurança HTTP a todas as respostas.

    Headers adicionados:
      - X-Content-Type-Options: nosniff
      - X-Frame-Options: DENY
      - Strict-Transport-Security: max-age=31536000; includeSubDomains
      - Permissions-Policy: restringe geolocation, microphone e camera
      - Referrer-Policy: strict-origin-when-cross-origin
    """

    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    }

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        for header, value in self.SECURITY_HEADERS.items():
            response.headers[header] = value
        return response
