from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.domains.auth.dependencies import require_role
from app.domains.selection_processes.schemas.selection_process_schema import (
    AddCandidatesRequest,
    SelectionProcessCreate,
)
from app.domains.selection_processes.services.selection_process_service import (
    SelectionProcessService,
)
from app.shared.schemas.default_response import DefaultResponse

router = APIRouter(prefix="/selection-processes", tags=["Processos Seletivos"])

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.get("", summary="Listar processos seletivos")
async def list_processes(
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    processes = await SelectionProcessService.get_all(db)
    return DefaultResponse(
        code=200,
        description="Lista de processos seletivos",
        path="/api/v1/selection-processes",
        data=[p.model_dump(mode="json") for p in processes],
    )


@router.get("/{process_id}", summary="Obter processo seletivo")
async def get_process(
    process_id: int,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    process = await SelectionProcessService.get_by_id(db, process_id)
    return DefaultResponse(
        code=200,
        description="Processo seletivo encontrado",
        path=f"/api/v1/selection-processes/{process_id}",
        data=process.model_dump(mode="json"),
    )


@router.post(
    "",
    summary="Criar processo seletivo",
    status_code=status.HTTP_201_CREATED,
)
async def create_process(
    request: Request,
    data: SelectionProcessCreate,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    process = await SelectionProcessService.create(db, data)
    return DefaultResponse(
        code=status.HTTP_201_CREATED,
        description="Processo seletivo criado com sucesso",
        path=str(request.url.path),
        data=process.model_dump(mode="json"),
    )


@router.post("/{process_id}/candidates", summary="Adicionar candidatos ao processo")
async def add_candidates(
    process_id: int,
    data: AddCandidatesRequest,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    process = await SelectionProcessService.add_candidates(db, process_id, data)
    return DefaultResponse(
        code=200,
        description="Candidatos adicionados com sucesso",
        path=f"/api/v1/selection-processes/{process_id}/candidates",
        data=process.model_dump(mode="json"),
    )


@router.get("/{process_id}/rankings", summary="Ranking do processo seletivo")
async def get_rankings(
    process_id: int,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    rankings = await SelectionProcessService.get_rankings(db, process_id)
    return DefaultResponse(
        code=200,
        description="Ranking do processo seletivo",
        path=f"/api/v1/selection-processes/{process_id}/rankings",
        data=[r.model_dump(mode="json") for r in rankings],
    )


@router.delete("/{process_id}", summary="Excluir processo seletivo")
async def delete_process(
    process_id: int,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
) -> DefaultResponse:
    await SelectionProcessService.delete(db, process_id)
    return DefaultResponse(
        code=200,
        description="Processo seletivo excluído com sucesso",
        path=f"/api/v1/selection-processes/{process_id}",
    )
