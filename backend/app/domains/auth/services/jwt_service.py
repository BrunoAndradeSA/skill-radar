from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt

from app.core.settings import settings


class JwtService:
    """Serviço para geração de tokens JWT com dados do usuário e papéis."""

    @staticmethod
    def _add_jti(payload: dict) -> dict:
        payload["jti"] = str(uuid4())
        return payload

    @staticmethod
    def generate_token(user) -> str:
        """Gera um token JWT contendo id, username e papéis do usuário.

        Args:
            user: Instância do modelo User com atributos id, username e roles.

        Returns:
            str: Token JWT codificado.
        """
        roles = [role.description for role in user.roles]

        access_token_expire = timedelta(minutes=settings.jwt_expire_minutes)

        payload = JwtService._add_jti(
            {
                "sub": str(user.id),
                "username": user.username,
                "roles": roles,
                "exp": datetime.now(UTC) + access_token_expire,
            }
        )

        return jwt.encode(
            payload,
            settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
        )

    @staticmethod
    def generate_refresh_token(user) -> str:
        """Gera um refresh token JWT com expiração de 7 dias.

        Args:
            user: Instância do modelo User.

        Returns:
            str: Refresh token JWT codificado.
        """
        payload = JwtService._add_jti(
            {
                "sub": str(user.id),
                "type": "refresh",
                "exp": datetime.now(UTC) + timedelta(days=7),
            }
        )

        return jwt.encode(
            payload,
            settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
        )

    @staticmethod
    def decode_refresh_token(token: str) -> dict | None:
        """Decodifica e valida um refresh token.

        Args:
            token: Token de refresh.

        Returns:
            dict | None: Payload do token ou None se inválido.
        """
        import jwt as pyjwt
        from jwt.exceptions import PyJWTError

        try:
            payload = pyjwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
            )
            if payload.get("type") != "refresh":
                return None
            return payload
        except PyJWTError:
            return None
