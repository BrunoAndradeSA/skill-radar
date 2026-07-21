from __future__ import annotations

import asyncio
import json
import time
from dataclasses import dataclass

import jwt
from jwt.exceptions import PyJWTError

from app.core.settings import settings
from app.db.session import AsyncSessionLocal
from app.domains.logs.services.request_log_service import RequestLogService


def _shell_escape(value: str) -> str:
    """Escapa aspas simples para uso seguro em comandos cURL no shell.

    Args:
        value: String a ser escapada.

    Returns:
        String com aspas simples escapadas.
    """
    return value.replace("'", "'\\''")


EXCLUDED_PREFIXES = frozenset(
    {
        "/docs",
        "/redoc",
        "/openapi.json",
        "/api/v1/logs/request",
        "/swagger-ui-theme-static",
    }
)


@dataclass
class _LogEntry:
    """Representa uma entrada de log de requisição HTTP."""

    method: str
    path: str
    status: int
    user_name: str | None
    duration_ms: int
    request_body: str | None
    response_body: str | None
    headers: str
    curl: str


class _ResponseCollector:
    """Intercepta a resposta ASGI para capturar o status e o corpo enviado."""

    def __init__(self, send):
        """Inicializa o coletor com a função ASGI de envio original.

        Args:
            send: Função ASGI send original da aplicação.
        """
        self._send = send
        self.status = 0
        self._chunks: list[bytes] = []

    async def __call__(self, message):
        """Processa mensagens ASGI de resposta, capturando status e corpo.

        Args:
            message: Mensagem ASGI (start ou body).
        """
        if message["type"] == "http.response.start":
            self.status = message.get("status", 0)
        elif message["type"] == "http.response.body":
            self._chunks.append(message.get("body", b""))
        await self._send(message)

    @property
    def body(self) -> bytes:
        """Retorna o corpo completo da resposta concatenado.

        Returns:
            bytes: Corpo completo da resposta HTTP.
        """
        return b"".join(self._chunks)


class _BodyReinjector:
    """Reinjetora o corpo da requisição lido antecipadamente para o stream ASGI."""

    def __init__(self, body: bytes, receive):
        """Inicializa a reinjetora com o corpo pré-lido e a função receive original.

        Args:
            body: Corpo da requisição já lido.
            receive: Função ASGI receive original.
        """
        self._body = body
        self._receive = receive
        self._reinjected = False

    async def __call__(self):
        """Retorna o corpo pré-lido na primeira chamada e delega as demais ao stream original.

        Returns:
            dict: Mensagem ASGI http.request com o corpo da requisição.
        """
        if not self._reinjected:
            self._reinjected = True
            return {"type": "http.request", "body": self._body, "more_body": False}
        return await self._receive()


class RequestLogMiddleware:
    """Middleware ASGI que registra todas as requisições HTTP no banco de dados."""

    def __init__(self, app):
        """Inicializa o middleware com a aplicação ASGI.

        Args:
            app: Aplicação ASGI que será envolvida pelo middleware.
        """
        self.app = app

    async def __call__(self, scope, receive, send):
        """Intercepta a requisição, coleta dados e persiste o log de forma assíncrona.

        Args:
            scope: Dicionário ASGI com metadados da requisição.
            receive: Função ASGI para receber mensagens da requisição.
            send: Função ASGI para enviar mensagens da resposta.
        """
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")

        if any(path.startswith(prefix) for prefix in EXCLUDED_PREFIXES):
            await self.app(scope, receive, send)
            return

        start_ns = time.time_ns()

        raw_request_body = await self._read_body(receive)
        headers = self._decode_headers(scope.get("headers", []))

        method = scope.get("method", "")

        collector = _ResponseCollector(send)
        reinjector = _BodyReinjector(raw_request_body, receive)

        await self.app(scope, reinjector, collector)

        entry = _LogEntry(
            method=method,
            path=path,
            status=collector.status,
            user_name=self._extract_user(headers),
            duration_ms=(time.time_ns() - start_ns) // 1_000_000,
            request_body=self._decode_truncate(raw_request_body),
            response_body=self._decode_truncate(collector.body)
            if settings.http_log_capture_response_body
            else None,
            headers=json.dumps(headers),
            curl=self._build_curl(
                method, path, scope.get("query_string", b""), headers, raw_request_body
            ),
        )

        asyncio.create_task(self._save_log(entry))

    @staticmethod
    def _decode_headers(headers: list[tuple[bytes, bytes]]) -> dict[str, str]:
        """Decodifica os cabeçalhos HTTP de bytes para dicionário string-string.

        Args:
            headers: Lista de tuplas (chave, valor) em bytes.

        Returns:
            dict: Cabeçalhos decodificados como dict[str, str].
        """
        return {k.decode(): v.decode() for k, v in headers}

    @staticmethod
    def _decode_truncate(data: bytes | None) -> str | None:
        """Decodifica bytes para string e trunca conforme o limite configurado.

        Args:
            data: Dados em bytes a serem decodificados.

        Returns:
            String decodificada e truncada, ou None se a entrada for None.
        """
        if data is None:
            return None
        value = data.decode("utf-8", errors="replace")
        if len(value) > settings.http_log_max_body_size:
            value = value[: settings.http_log_max_body_size]
        return value

    @staticmethod
    async def _read_body(receive) -> bytes:
        """Lê o corpo completo da requisição do stream ASGI.

        Args:
            receive: Função ASGI receive para ler mensagens da requisição.

        Returns:
            bytes: Corpo completo da requisição.
        """
        chunks = []
        more_body = True
        while more_body:
            message = await receive()
            if message["type"] == "http.request":
                body = message.get("body", b"")
                chunks.append(body)
                more_body = message.get("more_body", False)
        return b"".join(chunks)

    @staticmethod
    def _extract_user(headers: dict[str, str]) -> str | None:
        """Extrai o nome de usuário do token JWT presente no cabeçalho de autorização.

        Args:
            headers: Dicionário de cabeçalhos HTTP.

        Returns:
            Nome de usuário extraído do token, ou None se não houver token válido.
        """
        auth_header = headers.get("authorization")
        if not auth_header:
            return None

        try:
            token = auth_header.removeprefix("Bearer ").strip()
            payload = jwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
            )
            return payload.get("username")
        except PyJWTError:
            return None

    @staticmethod
    def _build_curl(
        method: str,
        path: str,
        query_string: bytes,
        headers: dict[str, str],
        body: bytes,
    ) -> str:
        """Constrói um comando cURL que reproduz a requisição original.

        Args:
            method: Método HTTP (GET, POST, etc.).
            path: Caminho da requisição.
            query_string: Query string em bytes.
            headers: Dicionário de cabeçalhos HTTP.
            body: Corpo da requisição em bytes.

        Returns:
            str: Comando cURL completo como string.
        """
        parts = [f"curl -X {method}"]

        host = headers.get("host", "localhost")
        qs = query_string.decode() if query_string else ""
        full_url = f"http://{host}{path}"
        if qs:
            full_url += f"?{qs}"
        parts.append(f"'{full_url}'")

        skip_headers = frozenset({"authorization", "host", "content-length"})
        for key, value in headers.items():
            if key.lower() not in skip_headers:
                parts.append(f"-H '{key}: {_shell_escape(value)}'")

        if body and method in ("POST", "PUT", "PATCH"):
            body_str = body.decode("utf-8", errors="replace")[:500]
            parts.append(f"-d '{_shell_escape(body_str)}'")

        return " ".join(parts)

    @staticmethod
    async def _save_log(entry: _LogEntry) -> None:
        """Persiste a entrada de log no banco de dados de forma assíncrona.

        Args:
            entry: Dados da entrada de log a ser salva.
        """
        async with AsyncSessionLocal() as session:
            await RequestLogService.create_log(session=session, data=entry.__dict__)
