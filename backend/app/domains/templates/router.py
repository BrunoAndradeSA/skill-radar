from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.domains.auth.dependencies import require_role
from app.domains.templates.schemas.template_schema import (
    TemplateCreate,
    TemplateOut,
    TemplateUpdate,
)
from app.domains.templates.services.template_service import TemplateService
from app.shared.schemas.default_response import DefaultResponse

router = APIRouter(prefix="/templates", tags=["Templates"])

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.get(
    "",
    summary="Listar templates",
    response_model=list[TemplateOut],
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        }
    },
)
async def list_templates(db: DbSession, _auth: None = require_role("ADMIN")):
    return await TemplateService.get_all(db)


@router.get(
    "/{template_id}",
    summary="Obter template por ID",
    response_model=TemplateOut,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Template não encontrado",
        },
    },
)
async def get_template(template_id: int, db: DbSession, _auth: None = require_role("ADMIN")):
    return await TemplateService.get_by_id(db, template_id)


@router.post(
    "",
    summary="Criar template",
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
async def create_template(
    request: Request, data: TemplateCreate, db: DbSession, _auth: None = require_role("ADMIN")
):
    template = await TemplateService.create(db, data)
    return DefaultResponse(
        code=status.HTTP_201_CREATED,
        description="Template criado com sucesso",
        path=str(request.url.path),
        data=template,
    )


@router.put(
    "/{template_id}",
    summary="Atualizar template",
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
            "description": "Template não encontrado",
        },
    },
)
async def update_template(
    request: Request,
    template_id: int,
    data: TemplateUpdate,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
):
    template = await TemplateService.update(db, template_id, data)
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Template atualizado com sucesso",
        path=str(request.url.path),
        data=template,
    )


@router.delete(
    "/{template_id}",
    summary="Remover template",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Template não encontrado",
        },
    },
)
async def delete_template(template_id: int, db: DbSession, _auth: None = require_role("ADMIN")):
    await TemplateService.delete(db, template_id)
