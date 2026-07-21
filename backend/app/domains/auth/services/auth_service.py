from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedError
from app.domains.auth.services.jwt_service import JwtService
from app.domains.auth.services.password_service import PasswordService
from app.domains.auth.services.token_blacklist_service import TokenBlacklistService
from app.domains.users.repositories.user_repository import UserRepository


class AuthService:
    """Serviço responsável pela autenticação de usuários e geração de tokens JWT."""

    @staticmethod
    def _build_user_dict(user) -> dict:
        from app.domains.users.schemas.user_response_schema import UserData

        return UserData(
            id=user.id,
            name=user.name or user.username,
            email=user.email,
            roles=[r.description for r in (user.roles or [])],
            enabled=user.enabled,
            created_at=user.created_at,
            updated_at=user.updated_at,
        ).model_dump()

    @staticmethod
    def _build_auth_response(user) -> dict:
        return {
            "access_token": JwtService.generate_token(user),
            "refresh_token": JwtService.generate_refresh_token(user),
            "user": AuthService._build_user_dict(user),
        }

    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        login: str,
        password: str,
    ) -> dict:
        """Autentica por username ou e-mail e retorna tokens + dados do usuário.

        Se ``login`` contiver ``@``, busca por e-mail; caso contrário, por username.

        Args:
            db: Sessão assíncrona do banco de dados.
            login: Nome de usuário ou e-mail.
            password: Senha do usuário.

        Returns:
            dict: access_token, refresh_token e dados do usuário.

        Raises:
            UnauthorizedError: Se as credenciais forem inválidas.
        """
        repo = UserRepository(db)

        if "@" in login:
            user = await repo.find_active_by_email(login)
        else:
            user = await repo.find_active_by_username(login)

        if (
            not user
            or not user.password_hash
            or not PasswordService.verify_password(password, user.password_hash)
        ):
            raise UnauthorizedError("Credenciais inválidas")

        if not any(r.description == "ADMIN" for r in (user.roles or [])):
            raise UnauthorizedError("Apenas usuários ADMIN podem fazer login")

        return AuthService._build_auth_response(user)

    @staticmethod
    async def authenticate_api_key(
        db: AsyncSession,
        client_id: str,
        client_secret: str,
    ) -> dict:
        """Autentica por client_id/client_secret e retorna tokens + dados do usuário.

        Args:
            db: Sessão assíncrona do banco de dados.
            client_id: Identificador do cliente.
            client_secret: Chave secreta do cliente.

        Returns:
            dict: access_token, refresh_token e dados do usuário.

        Raises:
            UnauthorizedError: Se as credenciais forem inválidas.
        """
        repo = UserRepository(db)

        user = await repo.find_active_by_client(client_id)

        if not user or not user.client_secret:
            raise UnauthorizedError("Credenciais inválidas")

        if user.client_secret.startswith("$argon2id$"):
            if not PasswordService.verify_password(client_secret, user.client_secret):
                raise UnauthorizedError("Credenciais inválidas")
        else:
            if user.client_secret != client_secret:
                raise UnauthorizedError("Credenciais inválidas")

        if not any(r.description == "ADMIN" for r in (user.roles or [])):
            raise UnauthorizedError("Apenas usuários ADMIN podem fazer login")

        return AuthService._build_auth_response(user)

    @staticmethod
    async def refresh_token(
        db: AsyncSession,
        refresh_token: str,
    ) -> dict:
        """Gera novos tokens a partir de um refresh token válido.

        Args:
            db: Sessão assíncrona do banco de dados.
            refresh_token: Token de refresh.

        Returns:
            dict: Novo access token e refresh token.

        Raises:
            UnauthorizedError: Se o refresh token for inválido.
        """
        payload = JwtService.decode_refresh_token(refresh_token)
        if payload is None:
            raise UnauthorizedError("Refresh token inválido ou expirado")

        if await TokenBlacklistService.is_blacklisted(db, payload["jti"]):
            raise UnauthorizedError("Refresh token já foi revogado")

        repo = UserRepository(db)
        user = await repo.get_by_id(int(payload["sub"]))
        if user is None or not user.enabled or user.deleted_at is not None:
            raise UnauthorizedError("Usuário não encontrado ou inativo")

        old_jti = payload["jti"]
        old_expires_at = datetime.fromtimestamp(payload["exp"], tz=UTC)

        new_access = JwtService.generate_token(user)
        new_refresh = JwtService.generate_refresh_token(user)

        await TokenBlacklistService.revoke(
            db=db,
            jti=old_jti,
            token_type="refresh",
            user_id=user.id,
            expires_at=old_expires_at,
        )

        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
        }

    @staticmethod
    async def get_current_user(
        db: AsyncSession,
        token: str,
    ) -> dict | None:
        """Retorna os dados do usuário autenticado a partir do token JWT.

        Args:
            db: Sessão assíncrona do banco de dados.
            token: Token JWT de acesso.

        Returns:
            dict: Dados do usuário ou None se inválido/inativo.
        """
        import jwt as pyjwt
        from jwt.exceptions import PyJWTError

        from app.core.settings import settings

        try:
            payload = pyjwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
            )
        except PyJWTError:
            return None

        if await TokenBlacklistService.is_blacklisted(db, payload.get("jti", "")):
            return None

        repo = UserRepository(db)
        user = await repo.get_by_id(int(payload["sub"]))
        if user is None or not user.enabled or user.deleted_at is not None:
            return None

        return AuthService._build_user_dict(user)
