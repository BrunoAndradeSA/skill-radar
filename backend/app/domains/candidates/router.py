from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.domains.auth.dependencies import require_role
from app.domains.candidates.schemas.candidate_request_schema import (
    CandidateCreateSchema,
    CandidateUpdateSchema,
)
from app.domains.candidates.schemas.candidate_response_schema import CandidateData
from app.domains.candidates.services.candidate_service import CandidateService
from app.shared.schemas.default_response import DefaultResponse

router = APIRouter(
    prefix="/candidates",
    tags=["Candidates"],
)

DbSession = Annotated[
    AsyncSession,
    Depends(get_db_session),
]


@router.get(
    "",
    summary="Listar candidatos",
    description="Retorna a lista de candidatos ativos. Permite filtrar por ID, e-mail e nome.",
    response_model=list[CandidateData],
    response_model_exclude_none=True,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        }
    },
)
async def list_candidates(
    db: DbSession,
    id: int | None = Query(default=None, description="Filtrar pelo ID exato"),
    email: str | None = Query(default=None, description="Filtrar por e-mail (busca parcial)"),
    name: str | None = Query(default=None, description="Filtrar por nome (busca parcial)"),
    _auth: None = require_role("ADMIN"),
) -> list[CandidateData]:
    return await CandidateService.list_candidates(db=db, candidate_id=id, email=email, name=name)


@router.get(
    "/{candidate_id}",
    summary="Obter candidato por ID",
    response_model=CandidateData,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Candidato não encontrado",
        },
    },
)
async def get_candidate(
    candidate_id: int,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> CandidateData:
    return await CandidateService.get_by_id(db=db, candidate_id=candidate_id)


@router.post(
    "",
    summary="Criar candidato",
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
async def create_candidate(
    request: Request,
    data: CandidateCreateSchema,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    candidate = await CandidateService.create(db=db, data=data)
    return DefaultResponse(
        code=status.HTTP_201_CREATED,
        description="Candidato criado com sucesso",
        path=str(request.url.path),
        data=candidate,
    )


@router.put(
    "/{candidate_id}",
    summary="Atualizar candidato",
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
            "description": "Candidato não encontrado",
        },
    },
)
async def update_candidate(
    request: Request,
    candidate_id: int,
    data: CandidateUpdateSchema,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    candidate = await CandidateService.update(db=db, candidate_id=candidate_id, data=data)
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Candidato atualizado com sucesso",
        path=str(request.url.path),
        data=candidate,
    )


@router.delete(
    "/{candidate_id}",
    summary="Excluir candidato (soft delete)",
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
            "description": "Candidato não encontrado",
        },
    },
)
async def delete_candidate(
    request: Request,
    candidate_id: int,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    candidate = await CandidateService.delete(db=db, candidate_id=candidate_id)
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Candidato excluído com sucesso",
        path=str(request.url.path),
        data=candidate,
    )
