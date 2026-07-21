from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.domains.auth.dependencies import require_role
from app.domains.competencies.schemas.competency_schema import (
    CompetencyCreate,
    CompetencyOut,
    CompetencyUpdate,
)
from app.domains.competencies.services.competency_service import CompetencyService
from app.shared.schemas.default_response import DefaultResponse

router = APIRouter(prefix="/competencies", tags=["Competencies"])

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.get(
    "",
    summary="Listar competências",
    response_model=list[CompetencyOut],
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        }
    },
)
async def list_competencies(
    db: DbSession,
    theme_id: int | None = Query(default=None, description="Filtrar por ID do tema"),
    _auth: None = require_role("ADMIN"),
):
    return await CompetencyService.get_all(db, theme_id=theme_id)


@router.get(
    "/{competency_id}",
    summary="Obter competência por ID",
    response_model=CompetencyOut,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Competência não encontrada",
        },
    },
)
async def get_competency(competency_id: int, db: DbSession, _auth: None = require_role("ADMIN")):
    return await CompetencyService.get_by_id(db, competency_id)


@router.post(
    "",
    summary="Criar competência",
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
async def create_competency(
    request: Request, data: CompetencyCreate, db: DbSession, _auth: None = require_role("ADMIN")
):
    competency = await CompetencyService.create(db, data)
    return DefaultResponse(
        code=status.HTTP_201_CREATED,
        description="Competência criada com sucesso",
        path=str(request.url.path),
        data=competency,
    )


@router.put(
    "/{competency_id}",
    summary="Atualizar competência",
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
            "description": "Competência não encontrada",
        },
    },
)
async def update_competency(
    request: Request,
    competency_id: int,
    data: CompetencyUpdate,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
):
    competency = await CompetencyService.update(db, competency_id, data)
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Competência atualizada com sucesso",
        path=str(request.url.path),
        data=competency,
    )


@router.delete(
    "/{competency_id}",
    summary="Remover competência",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Competência não encontrada",
        },
    },
)
async def delete_competency(competency_id: int, db: DbSession, _auth: None = require_role("ADMIN")):
    await CompetencyService.delete(db, competency_id)
