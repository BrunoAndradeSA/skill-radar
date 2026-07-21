from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.domains.auth.dependencies import require_role
from app.domains.themes.schemas.theme_schema import ThemeCreate, ThemeOut, ThemeUpdate
from app.domains.themes.services.theme_service import ThemeService
from app.shared.schemas.default_response import DefaultResponse

router = APIRouter(prefix="/themes", tags=["Themes"])

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.get(
    "",
    summary="Listar temas",
    response_model=list[ThemeOut],
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        }
    },
)
async def list_themes(db: DbSession, _auth: None = require_role("ADMIN")):
    return await ThemeService.get_all(db)


@router.get(
    "/{theme_id}",
    summary="Obter tema por ID",
    response_model=ThemeOut,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Tema não encontrado",
        },
    },
)
async def get_theme(theme_id: int, db: DbSession, _auth: None = require_role("ADMIN")):
    return await ThemeService.get_by_id(db, theme_id)


@router.post(
    "",
    summary="Criar tema",
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
async def create_theme(
    request: Request, data: ThemeCreate, db: DbSession, _auth: None = require_role("ADMIN")
):
    theme = await ThemeService.create(db, data)
    return DefaultResponse(
        code=status.HTTP_201_CREATED,
        description="Tema criado com sucesso",
        path=str(request.url.path),
        data=theme,
    )


@router.put(
    "/{theme_id}",
    summary="Atualizar tema",
    response_model=DefaultResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": DefaultResponse,
            "description": "Dados inválidos para atualização",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Tema não encontrado",
        },
    },
)
async def update_theme(
    request: Request,
    theme_id: int,
    data: ThemeUpdate,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
):
    theme = await ThemeService.update(db, theme_id, data)
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Tema atualizado com sucesso",
        path=str(request.url.path),
        data=theme,
    )


@router.delete(
    "/{theme_id}",
    summary="Remover tema",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Tema não encontrado",
        },
    },
)
async def delete_theme(theme_id: int, db: DbSession, _auth: None = require_role("ADMIN")):
    await ThemeService.delete(db, theme_id)
