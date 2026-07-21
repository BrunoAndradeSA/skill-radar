from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.domains.auth.dependencies import require_role
from app.domains.invitations.schemas.invitation_schema import (
    InvitationCreate,
    InvitationOut,
    InvitationPublicOut,
    InvitationUpdate,
    ValidateInvitationRequest,
)
from app.domains.invitations.services.invitation_service import InvitationService
from app.shared.schemas.default_response import DefaultResponse

router = APIRouter(prefix="/invitations", tags=["Invitations"])

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.get(
    "",
    summary="Listar convites",
    response_model=list[InvitationOut],
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        }
    },
)
async def list_invitations(
    db: DbSession,
    is_external: bool | None = Query(default=None, description="Filtrar por externo"),
    email: str | None = Query(default=None, description="Filtrar por email do candidato"),
    _auth: None = require_role("ADMIN"),
):
    return await InvitationService.get_all(db, is_external=is_external, email=email)


@router.get(
    "/{invitation_id}",
    summary="Obter convite por ID",
    response_model=InvitationPublicOut,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Convite não encontrado",
        },
    },
)
async def get_invitation(
    invitation_id: int,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> InvitationPublicOut:
    return await InvitationService.get_by_id(db, invitation_id)


@router.post(
    "/validate",
    summary="Validar convite (token + access_code)",
    response_model=DefaultResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": DefaultResponse,
            "description": "Dados inválidos para validação",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Convite não encontrado",
        },
    },
)
async def validate_invitation(request: Request, data: ValidateInvitationRequest, db: DbSession):
    invitation = await InvitationService.validate(db, data)
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Convite validado com sucesso",
        path=str(request.url.path),
        data=invitation,
    )


@router.get(
    "/token/{token}",
    summary="Buscar convite por token",
    response_model=InvitationPublicOut,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Convite não encontrado",
        }
    },
)
async def get_invitation_by_token(token: str, db: DbSession) -> InvitationPublicOut:
    return await InvitationService.get_by_token(db, token)


@router.post(
    "",
    summary="Criar convite",
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
async def create_invitation(
    request: Request, data: InvitationCreate, db: DbSession, _auth: None = require_role("ADMIN")
):
    invitation = await InvitationService.create(db, data)
    return DefaultResponse(
        code=status.HTTP_201_CREATED,
        description="Convite criado com sucesso",
        path=str(request.url.path),
        data=invitation,
    )


@router.patch(
    "/{invitation_id}",
    summary="Atualizar convite parcialmente",
    response_model=DefaultResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": DefaultResponse,
            "description": "Dados inválidos para atualização",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Convite não encontrado",
        },
    },
)
async def update_invitation(
    request: Request,
    invitation_id: int,
    data: InvitationUpdate,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
):
    invitation = await InvitationService.update(db, invitation_id, data)
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Convite atualizado com sucesso",
        path=str(request.url.path),
        data=invitation,
    )


@router.delete(
    "/{invitation_id}",
    summary="Remover convite",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Convite não encontrado",
        },
    },
)
async def delete_invitation(invitation_id: int, db: DbSession, _auth: None = require_role("ADMIN")):
    await InvitationService.delete(db, invitation_id)
