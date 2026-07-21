from __future__ import annotations

from typing import Annotated

import jwt as pyjwt
from fastapi import APIRouter, Depends, Request, Security, status
from fastapi.security import HTTPAuthorizationCredentials
from jwt.exceptions import PyJWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.core.exceptions import UnauthorizedError
from app.core.rate_limiter import limiter
from app.core.settings import settings
from app.domains.auth.dependencies import security_scheme
from app.domains.auth.schemas.auth_request_schema import (
    ApiKeyAuthRequestSchema,
    LoginRequestSchema,
    RefreshTokenRequestSchema,
)
from app.domains.auth.schemas.auth_response_schemas import (
    RefreshTokenResponseSchema,
    TokenResponseSchema,
)
from app.domains.auth.services.auth_service import AuthService
from app.shared.schemas.default_response import DefaultResponse

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.post(
    "/login",
    summary="Autenticar com username ou e-mail",
    response_model=TokenResponseSchema,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Credenciais inválidas",
        }
    },
)
@limiter.limit(settings.rate_limit_login)
async def generate_token(
    request: Request,
    login_data: LoginRequestSchema,
    db: DbSession,
):
    """Gera token JWT + refresh token a partir de username ou e-mail."""
    result = await AuthService.authenticate_user(
        db=db,
        login=login_data.username,
        password=login_data.password,
    )

    return TokenResponseSchema(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        user=result["user"],
    )


@router.post(
    "/refresh",
    summary="Refresh token",
    response_model=RefreshTokenResponseSchema,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token inválido ou expirado",
        }
    },
)
@limiter.limit(settings.rate_limit_refresh)
async def refresh_token(
    request: Request,
    refresh_data: RefreshTokenRequestSchema,
    db: DbSession,
):
    """Gera novos tokens a partir de um refresh token válido."""
    result = await AuthService.refresh_token(
        db=db,
        refresh_token=refresh_data.refresh_token,
    )
    return RefreshTokenResponseSchema(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
    )


@router.post(
    "/logout",
    summary="Logout",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou expirado",
        }
    },
)
async def logout(
    db: DbSession,
    credentials: HTTPAuthorizationCredentials | None = Security(security_scheme),  # noqa: B008
):
    """Invalida a sessão do usuário revogando o token atual."""
    if credentials is None:
        raise UnauthorizedError("Token ausente ou inválido")

    from datetime import UTC, datetime

    from app.domains.auth.services.token_blacklist_service import (
        TokenBlacklistService,
    )

    try:
        payload = pyjwt.decode(
            credentials.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except PyJWTError:
        raise UnauthorizedError("Token inválido ou expirado") from None

    jti = payload.get("jti")
    exp = payload.get("exp")
    user_id = payload.get("sub")

    if jti:
        await TokenBlacklistService.revoke(
            db=db,
            jti=jti,
            token_type="access",
            user_id=int(user_id) if user_id else None,
            expires_at=datetime.fromtimestamp(exp, tz=UTC) if exp else None,
        )


@router.get(
    "/me",
    summary="Usuário logado",
    response_model=DefaultResponse,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou expirado",
        }
    },
)
async def get_me(
    request: Request,
    db: DbSession,
    credentials: HTTPAuthorizationCredentials | None = Security(security_scheme),  # noqa: B008
):
    """Retorna os dados do usuário autenticado com base no token JWT."""
    if credentials is None:
        raise UnauthorizedError("Token ausente ou inválido")

    user_data = await AuthService.get_current_user(db=db, token=credentials.credentials)

    if user_data is None:
        raise UnauthorizedError("Token inválido ou expirado")

    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Dados do usuário atual",
        path=str(request.url.path),
        data=user_data,
    )


@router.post(
    "/token",
    summary="Autenticar com client_id e client_secret",
    response_model=TokenResponseSchema,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Credenciais inválidas",
        }
    },
)
@limiter.limit(settings.rate_limit_token)
async def generate_api_key_token(
    request: Request,
    api_key_data: ApiKeyAuthRequestSchema,
    db: DbSession,
):
    """Gera token JWT + refresh token a partir de client_id e client_secret."""
    result = await AuthService.authenticate_api_key(
        db=db,
        client_id=api_key_data.client_id,
        client_secret=api_key_data.client_secret,
    )

    return TokenResponseSchema(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        user=result["user"],
    )
