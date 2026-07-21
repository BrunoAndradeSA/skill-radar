from fastapi import status


class AppError(Exception):
    """Exceção base da aplicação com código HTTP e descrição."""

    def __init__(self, code: int, description: str) -> None:
        """Inicializa a exceção com código HTTP e mensagem descritiva.

        Args:
            code: Código de status HTTP.
            description: Mensagem descritiva do erro.
        """
        self.code = code
        self.description = description

        super().__init__(description)


class BadRequestError(AppError):
    """Erro para requisições inválidas (HTTP 400)."""

    def __init__(self, description: str) -> None:
        """Inicializa o erro com status 400 e mensagem descritiva.

        Args:
            description: Descrição do erro de requisição.
        """
        super().__init__(code=status.HTTP_400_BAD_REQUEST, description=description)


class NotFoundError(AppError):
    """Erro para recursos não encontrados (HTTP 404)."""

    def __init__(self, description: str) -> None:
        """Inicializa o erro com status 404 e mensagem descritiva.

        Args:
            description: Descrição do recurso não encontrado.
        """
        super().__init__(code=status.HTTP_404_NOT_FOUND, description=description)


class UnauthorizedError(AppError):
    """Erro para credenciais inválidas ou acesso negado (HTTP 401)."""

    def __init__(self, description: str) -> None:
        """Inicializa o erro com status 401 e mensagem descritiva.

        Args:
            description: Descrição do erro de autenticação/autorização.
        """
        super().__init__(code=status.HTTP_401_UNAUTHORIZED, description=description)


class ForbiddenError(AppError):
    """Erro para acesso proibido (HTTP 403)."""

    def __init__(self, description: str) -> None:
        """Inicializa o erro com status 403 e mensagem descritiva.

        Args:
            description: Descrição do erro de permissão.
        """
        super().__init__(code=status.HTTP_403_FORBIDDEN, description=description)
