from datetime import UTC, datetime
from typing import TYPE_CHECKING

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.core.exceptions import AppError
from app.core.logging import logger
from app.shared.schemas.default_response import DefaultResponse

if TYPE_CHECKING:
    from fastapi import FastAPI, Request


def register_exception_handlers(app: FastAPI) -> None:
    """Registra os handlers de exceções customizadas na aplicação FastAPI.

    Args:
        app: Instância da aplicação FastAPI onde os handlers serão registrados.
    """

    @app.exception_handler(AppError)
    async def handle_app_exception(
        request: Request,
        exc: AppError,
    ) -> JSONResponse:
        """Captura exceções AppError e retorna uma resposta JSON padronizada.

        Args:
            request: Objeto da requisição HTTP.
            exc: Instância da exceção AppError capturada.

        Returns:
            JSONResponse: Resposta JSON com código, descrição, caminho e timestamp.
        """
        response = DefaultResponse(
            code=exc.code,
            description=exc.description,
            path=request.url.path,
            timestamp=datetime.now(UTC),
        )

        logger.error(exc.description)

        return JSONResponse(
            status_code=exc.code,
            content=response.model_dump(mode="json"),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        """Captura erros de validação Pydantic e retorna resposta padronizada em pt-BR.

        Args:
            request: Objeto da requisição HTTP.
            exc: Exceção de validação capturada.

        Returns:
            JSONResponse: Resposta JSON com código 422.
        """
        errors = exc.errors()
        messages: list[str] = []
        for err in errors:
            field = ".".join(str(loc) for loc in err.get("loc", [])) if err.get("loc") else ""
            msg = err.get("msg", "")
            if field:
                messages.append(f"Campo '{field}': {msg}")
            else:
                messages.append(msg)

        response = DefaultResponse(
            code=422,
            description="Erro de validação: " + "; ".join(messages),
            path=request.url.path,
            timestamp=datetime.now(UTC),
        )

        logger.warning(response.description)

        return JSONResponse(
            status_code=422,
            content=response.model_dump(mode="json"),
        )

    @app.exception_handler(IntegrityError)
    async def handle_integrity_error(
        request: Request,
        exc: IntegrityError,
    ) -> JSONResponse:
        """Captura erros de integridade do banco e retorna 400 ou 409.

        Args:
            request: Objeto da requisição HTTP.
            exc: Exceção de integridade capturada.
        """
        logger.error(f"Erro de integridade: {exc}")

        orig = str(exc.orig) if exc.orig else ""
        if "foreign key constraint" in orig.lower() and "not present" in orig.lower():
            description = (
                "Recurso referenciado não encontrado. Verifique se os IDs enviados estão corretos."
            )
        elif "unique constraint" in orig.lower() or "duplicate key" in orig.lower():
            description = "Registro duplicado. O recurso já existe."
        else:
            description = "Erro de integridade no banco de dados."

        response = DefaultResponse(
            code=400,
            description=description,
            path=request.url.path,
            timestamp=datetime.now(UTC),
        )

        return JSONResponse(
            status_code=400,
            content=response.model_dump(mode="json"),
        )
