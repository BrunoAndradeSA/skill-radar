from __future__ import annotations

from unittest.mock import patch

import jwt

from app.core.settings import settings
from app.shared.middleware.http_logger_middleware import (
    RequestLogMiddleware,
    _BodyReinjector,
    _ResponseCollector,
    _shell_escape,
)


class TestShellEscape:
    def test_no_quotes(self):
        """Testa que string sem aspas simples retorna igual."""
        assert _shell_escape("hello") == "hello"

    def test_single_quote(self):
        """Testa que aspas simples são escapadas com sequência de shell."""
        assert _shell_escape("it's") == "it'\\''s"

    def test_multiple_quotes(self):
        """Testa que múltiplas aspas simples são escapadas corretamente."""
        assert _shell_escape("'a' 'b'") == "'\\''a'\\'' '\\''b'\\''"

    def test_empty_string(self):
        """Testa que string vazia retorna vazia."""
        assert _shell_escape("") == ""

    def test_only_quote(self):
        """Testa que uma única aspa simples é escapada."""
        assert _shell_escape("'") == "'\\''"


class TestDecodeHeaders:
    def test_empty_list(self):
        """Testa que lista vazia retorna dicionário vazio."""
        result = RequestLogMiddleware._decode_headers([])
        assert result == {}

    def test_single_header(self):
        """Testa decodificação de um único cabeçalho."""
        result = RequestLogMiddleware._decode_headers([(b"host", b"localhost")])
        assert result == {"host": "localhost"}

    def test_multiple_headers(self):
        """Testa decodificação de múltiplos cabeçalhos."""
        headers = [
            (b"content-type", b"application/json"),
            (b"authorization", b"Bearer token123"),
            (b"x-custom", b"value"),
        ]
        result = RequestLogMiddleware._decode_headers(headers)
        assert result == {
            "content-type": "application/json",
            "authorization": "Bearer token123",
            "x-custom": "value",
        }

    def test_unicode_values(self):
        """Testa decodificação de valores com caracteres UTF-8."""
        result = RequestLogMiddleware._decode_headers([(b"x-utf8", b"caf\xc3\xa9")])
        assert result == {"x-utf8": "café"}


class TestDecodeTruncate:
    def test_none_input(self):
        """Testa que entrada None retorna None."""
        assert RequestLogMiddleware._decode_truncate(None) is None

    def test_small_text(self):
        """Testa que texto pequeno não é truncado."""
        result = RequestLogMiddleware._decode_truncate(b"hello")
        assert result == "hello"

    def test_truncation(self):
        """Testa que texto maior que o limite é truncado."""
        with patch.object(settings, "http_log_max_body_size", 5):
            result = RequestLogMiddleware._decode_truncate(b"hello world")
            assert result == "hello"
            assert len(result) == 5

    def test_exact_limit(self):
        """Testa que texto no tamanho exato do limite não é truncado."""
        with patch.object(settings, "http_log_max_body_size", 5):
            result = RequestLogMiddleware._decode_truncate(b"hello")
            assert result == "hello"

    def test_utf8_replacement(self):
        """Testa que bytes inválidos são substituídos sem erro."""
        result = RequestLogMiddleware._decode_truncate(b"\xff\xfe")
        assert isinstance(result, str)


class TestExtractUser:
    def _make_token(self, **claims) -> str:
        payload = {"sub": "1", "username": "admin", "roles": ["ADMIN"], **claims}
        return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

    def test_no_auth_header(self):
        """Testa que retorna None quando não há cabeçalho de autorização."""
        result = RequestLogMiddleware._extract_user({})
        assert result is None

    def test_valid_token(self):
        """Testa que extrai o username de um token JWT válido."""
        token = self._make_token()
        headers = {"authorization": f"Bearer {token}"}
        result = RequestLogMiddleware._extract_user(headers)
        assert result == "admin"

    def test_invalid_token(self):
        """Testa que retorna None para token JWT inválido."""
        headers = {"authorization": "Bearer invalid.token.here"}
        result = RequestLogMiddleware._extract_user(headers)
        assert result is None

    def test_malformed_token(self):
        """Testa que retorna None para token mal formatado."""
        headers = {"authorization": "Bearer not-a-jwt"}
        result = RequestLogMiddleware._extract_user(headers)
        assert result is None

    def test_no_bearer_prefix(self):
        """Testa que token sem prefixo Bearer ainda é decodificado se for um JWT válido."""
        token = self._make_token()
        headers = {"authorization": token}
        result = RequestLogMiddleware._extract_user(headers)
        assert result == "admin"

    def test_empty_bearer_token(self):
        """Testa que retorna None quando o token Bearer é vazio."""
        headers = {"authorization": "Bearer "}
        result = RequestLogMiddleware._extract_user(headers)
        assert result is None

    def test_username_not_in_payload(self):
        """Testa que retorna None quando o payload não contém username."""
        token = self._make_token(username=None)
        headers = {"authorization": f"Bearer {token}"}
        result = RequestLogMiddleware._extract_user(headers)
        assert result is None


class TestBuildCurl:
    def test_get_request(self):
        """Testa geração de comando cURL para requisição GET."""
        curl = RequestLogMiddleware._build_curl(
            method="GET",
            path="/api/v1/health/ready",
            query_string=b"",
            headers={"host": "localhost:8000"},
            body=b"",
        )
        assert curl.startswith("curl -X GET")
        assert "localhost:8000" in curl
        assert "-d" not in curl

    def test_post_with_body(self):
        """Testa geração de cURL para POST com corpo JSON."""
        curl = RequestLogMiddleware._build_curl(
            method="POST",
            path="/api/v1/auth/login",
            query_string=b"",
            headers={
                "host": "localhost:8000",
                "content-type": "application/json",
            },
            body=b'{"username": "admin", "password": "secret"}',
        )
        assert curl.startswith("curl -X POST")
        assert "-d" in curl
        assert "admin" in curl

    def test_with_query_string(self):
        """Testa geração de cURL para requisição com query string."""
        curl = RequestLogMiddleware._build_curl(
            method="GET",
            path="/api/v1/users",
            query_string=b"role=ADMIN&page=1",
            headers={"host": "localhost"},
            body=b"",
        )
        assert "?" in curl
        assert "role=ADMIN" in curl

    def test_skips_sensitive_headers(self):
        """Testa que cabeçalhos sensíveis (authorization, host) são omitidos."""
        curl = RequestLogMiddleware._build_curl(
            method="GET",
            path="/test",
            query_string=b"",
            headers={
                "host": "localhost",
                "authorization": "Bearer secret",
                "content-type": "application/json",
                "content-length": "0",
            },
            body=b"",
        )
        assert "Bearer" not in curl
        assert "content-length" not in curl
        assert "content-type" in curl

    def test_get_without_body(self):
        """Testa que requisições GET não incluem flag -d."""
        curl = RequestLogMiddleware._build_curl(
            method="GET",
            path="/test",
            query_string=b"",
            headers={"host": "localhost"},
            body=b"some_body",
        )
        assert "-d" not in curl

    def test_put_with_body(self):
        """Testa que requisições PUT incluem corpo."""
        curl = RequestLogMiddleware._build_curl(
            method="PUT",
            path="/api/v1/users/1",
            query_string=b"",
            headers={"host": "localhost", "content-type": "application/json"},
            body=b'{"name": "updated"}',
        )
        assert "-d" in curl
        assert "updated" in curl

    def test_patch_with_body(self):
        """Testa que requisições PATCH incluem corpo."""
        curl = RequestLogMiddleware._build_curl(
            method="PATCH",
            path="/api/v1/users/1",
            query_string=b"",
            headers={"host": "localhost"},
            body=b'{"field": "value"}',
        )
        assert "-d" in curl

    def test_escape_single_quote_in_body(self):
        """Testa que aspas simples no corpo são escapadas no cURL."""
        curl = RequestLogMiddleware._build_curl(
            method="POST",
            path="/test",
            query_string=b"",
            headers={"host": "localhost"},
            body=b"it's a test",
        )
        assert "it'\\''s" in curl


class TestReadBody:
    async def test_single_chunk(self):
        """Testa leitura de corpo com um único chunk."""

        async def receive():
            return {"type": "http.request", "body": b"hello", "more_body": False}

        result = await RequestLogMiddleware._read_body(receive)
        assert result == b"hello"

    async def test_multiple_chunks(self):
        """Testa leitura de corpo com múltiplos chunks."""
        chunks = [b"hello ", b"world", b"!"]

        async def receive():
            if chunks:
                body = chunks.pop(0)
                return {"type": "http.request", "body": body, "more_body": len(chunks) > 0}
            return {"type": "http.request", "body": b"", "more_body": False}

        result = await RequestLogMiddleware._read_body(receive)
        assert result == b"hello world!"

    async def test_empty_body(self):
        """Testa leitura de corpo vazio."""

        async def receive():
            return {"type": "http.request", "body": b"", "more_body": False}

        result = await RequestLogMiddleware._read_body(receive)
        assert result == b""

    async def test_ignores_non_request_messages(self):
        """Testa que mensagens não-http.request são ignoradas."""
        messages = [
            {"type": "http.disconnect"},
            {"type": "http.request", "body": b"data", "more_body": False},
        ]

        async def receive():
            return messages.pop(0)

        result = await RequestLogMiddleware._read_body(receive)
        assert result == b"data"


class TestResponseCollector:
    async def test_captures_status_and_body(self):
        """Testa que o coletor captura status e corpo da resposta."""
        sent_messages = []

        async def send(msg):
            sent_messages.append(msg)

        collector = _ResponseCollector(send)
        await collector({"type": "http.response.start", "status": 201})
        await collector({"type": "http.response.body", "body": b'{"id": 1}'})

        assert collector.status == 201
        assert collector.body == b'{"id": 1}'
        assert len(sent_messages) == 2

    async def test_multiple_body_chunks(self):
        """Testa que múltiplos chunks de corpo são concatenados."""
        sent_messages = []

        async def send(msg):
            sent_messages.append(msg)

        collector = _ResponseCollector(send)
        await collector({"type": "http.response.start", "status": 200})
        await collector({"type": "http.response.body", "body": b'{"a": 1'})
        await collector({"type": "http.response.body", "body": b', "b": 2}'})

        assert collector.body == b'{"a": 1, "b": 2}'

    async def test_default_status_zero(self):
        """Testa que o status inicial é 0 antes de receber resposta."""
        sent_messages = []

        async def send(msg):
            sent_messages.append(msg)

        collector = _ResponseCollector(send)
        assert collector.status == 0
        assert collector.body == b""


class TestBodyReinjector:
    async def test_reinjects_body_on_first_call(self):
        """Testa que o corpo pré-lido é reinjetado na primeira chamada."""

        async def original_receive():
            return {"type": "http.request", "body": b"later", "more_body": False}

        reinjector = _BodyReinjector(b"original_body", original_receive)
        msg = await reinjector()

        assert msg["body"] == b"original_body"
        assert msg["more_body"] is False

    async def test_delegates_to_original_on_second_call(self):
        """Testa que chamadas subsequentes delegam ao receive original."""
        calls = []

        async def original_receive():
            calls.append(1)
            return {"type": "http.request", "body": b"later", "more_body": False}

        reinjector = _BodyReinjector(b"first", original_receive)
        await reinjector()
        msg = await reinjector()

        assert msg["body"] == b"later"
        assert len(calls) == 1
