from __future__ import annotations

from fastapi import status

from app.core.exceptions import AppError, BadRequestError, NotFoundError, UnauthorizedError


class TestAppError:
    def test_app_error_attributes(self):
        """Testa que AppError armazena corretamente código e descrição."""
        exc = AppError(code=418, description="I'm a teapot")
        assert exc.code == 418
        assert exc.description == "I'm a teapot"

    def test_app_error_str(self):
        """Testa que a representação em string de AppError retorna a descrição."""
        exc = AppError(code=400, description="Bad request")
        assert str(exc) == "Bad request"


class TestBadRequestError:
    def test_status_code(self):
        """Testa que BadRequestError usa o código HTTP 400."""
        exc = BadRequestError("Invalid data")
        assert exc.code == status.HTTP_400_BAD_REQUEST

    def test_inheritance(self):
        """Testa que BadRequestError herda de AppError."""
        exc = BadRequestError("test")
        assert isinstance(exc, AppError)

    def test_description(self):
        """Testa que BadRequestError armazena a descrição corretamente."""
        exc = BadRequestError("Username already exists")
        assert exc.description == "Username already exists"


class TestNotFoundError:
    def test_status_code(self):
        """Testa que NotFoundError usa o código HTTP 404."""
        exc = NotFoundError("User not found")
        assert exc.code == status.HTTP_404_NOT_FOUND

    def test_inheritance(self):
        """Testa que NotFoundError herda de AppError."""
        exc = NotFoundError("test")
        assert isinstance(exc, AppError)


class TestUnauthorizedError:
    def test_status_code(self):
        """Testa que UnauthorizedError usa o código HTTP 401."""
        exc = UnauthorizedError("Invalid credentials")
        assert exc.code == status.HTTP_401_UNAUTHORIZED

    def test_inheritance(self):
        """Testa que UnauthorizedError herda de AppError."""
        exc = UnauthorizedError("test")
        assert isinstance(exc, AppError)
