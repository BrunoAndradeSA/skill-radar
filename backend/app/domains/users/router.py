from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.core.exceptions import BadRequestError
from app.domains.assessments.schemas.stats_schema import UserStats
from app.domains.assessments.services.assessment_service import AssessmentService
from app.domains.auth.dependencies import require_role
from app.domains.users.schemas.user_request_schema import (
    UserCreateSchema,
    UserUpdateSchema,
)
from app.domains.users.schemas.user_response_schema import UserData
from app.domains.users.services.user_service import UserService
from app.shared.schemas.default_response import DefaultResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

DbSession = Annotated[
    AsyncSession,
    Depends(get_db_session),
]


@router.get(
    "",
    summary="Listar usuários",
    description="Retorna a lista de usuários ativos. Permite filtrar por ID, e-mail e nome.",
    response_model=list[UserData],
    response_model_exclude_none=True,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        }
    },
)
async def list_users(
    db: DbSession,
    id: int | None = Query(default=None, description="Filtrar pelo ID exato"),
    email: str | None = Query(default=None, description="Filtrar por e-mail (busca parcial)"),
    name: str | None = Query(default=None, description="Filtrar por nome (busca parcial)"),
    _auth: None = require_role("ADMIN"),
) -> list[UserData]:
    return await UserService.list_users(db=db, user_id=id, email=email, name=name)


@router.get(
    "/{user_id}",
    summary="Obter usuário por ID",
    response_model=UserData,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Usuário não encontrado",
        },
    },
)
async def get_user(
    user_id: int,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> UserData:
    return await UserService.get_by_id(db=db, user_id=user_id)


@router.get(
    "/email/{email}",
    summary="Buscar usuário por e-mail",
    response_model=UserData,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Usuário não encontrado",
        },
    },
)
async def get_user_by_email(
    email: str,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> UserData:
    return await UserService.get_by_email(db=db, email=email)


@router.get(
    "/{user_id}/stats",
    summary="Estatísticas do usuário",
    response_model=UserStats,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Usuário não encontrado",
        },
    },
)
async def get_user_stats(
    user_id: int,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> UserStats:
    return await AssessmentService.get_user_stats(db=db, user_id=user_id)


@router.post(
    "",
    summary="Criar usuário",
    status_code=status.HTTP_201_CREATED,
    response_model=DefaultResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": DefaultResponse,
            "description": "Dados inválidos para criação",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
    },
)
async def create_user(
    request: Request,
    data: UserCreateSchema,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    user = await UserService.create_user(db=db, data=data)
    return DefaultResponse(
        code=status.HTTP_201_CREATED,
        description="Usuário criado com sucesso",
        path=str(request.url.path),
        data=user,
    )


@router.put(
    "/{user_id}",
    summary="Atualizar usuário",
    response_model=DefaultResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": DefaultResponse,
            "description": "Dados inválidos ou nenhum campo para atualizar",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Usuário não encontrado",
        },
    },
)
async def update_user(
    request: Request,
    user_id: int,
    data: UserUpdateSchema,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    if not any(
        [
            data.name is not None,
            data.email is not None,
            data.password is not None,
        ]
    ):
        raise BadRequestError("Nenhum campo para atualizar")

    user = await UserService.update_user(db=db, user_id=user_id, data=data)
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Usuário atualizado com sucesso",
        path=str(request.url.path),
        data=user,
    )


@router.delete(
    "/{user_id}",
    summary="Excluir usuário (soft delete)",
    response_model=DefaultResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": DefaultResponse,
            "description": "Dados inválidos para exclusão",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Usuário não encontrado",
        },
    },
)
async def delete_user(
    request: Request,
    user_id: int,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    user = await UserService.delete_user(db=db, user_id=user_id)
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Usuário excluído com sucesso",
        path=str(request.url.path),
        data=user,
    )
