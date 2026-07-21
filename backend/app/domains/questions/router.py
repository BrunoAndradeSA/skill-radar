from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.domains.auth.dependencies import require_role
from app.domains.questions.schemas.question_schema import (
    QuestionCreate,
    QuestionOut,
    QuestionUpdate,
)
from app.domains.questions.services.question_service import QuestionService
from app.shared.schemas.default_response import DefaultResponse

router = APIRouter(prefix="/questions", tags=["Questions"])

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.get(
    "",
    summary="Listar questões",
    response_model=list[QuestionOut],
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        }
    },
)
async def list_questions(
    db: DbSession,
    theme_id: int | None = Query(default=None, description="Filtrar por ID do tema"),
    seniority: str | None = Query(default=None, description="Filtrar por senioridade"),
    type: str | None = Query(default=None, description="Filtrar por tipo (NORMAL, CERTIFICATION)"),
    _auth: None = require_role("ADMIN"),
):
    return await QuestionService.get_all(db, theme_id=theme_id, seniority=seniority, type=type)


@router.get(
    "/{question_id}",
    summary="Obter questão por ID",
    response_model=QuestionOut,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Questão não encontrada",
        },
    },
)
async def get_question(question_id: int, db: DbSession, _auth: None = require_role("ADMIN")):
    return await QuestionService.get_by_id(db, question_id)


@router.post(
    "",
    summary="Criar questão",
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
async def create_question(
    request: Request, data: QuestionCreate, db: DbSession, _auth: None = require_role("ADMIN")
):
    question = await QuestionService.create(db, data)
    return DefaultResponse(
        code=status.HTTP_201_CREATED,
        description="Questão criada com sucesso",
        path=str(request.url.path),
        data=question,
    )


@router.put(
    "/{question_id}",
    summary="Atualizar questão",
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
            "description": "Questão não encontrada",
        },
    },
)
async def update_question(
    request: Request,
    question_id: int,
    data: QuestionUpdate,
    db: DbSession,
    _auth: None = require_role("ADMIN"),
):
    question = await QuestionService.update(db, question_id, data)
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Questão atualizada com sucesso",
        path=str(request.url.path),
        data=question,
    )


@router.delete(
    "/{question_id}",
    summary="Remover questão",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Questão não encontrada",
        },
    },
)
async def delete_question(question_id: int, db: DbSession, _auth: None = require_role("ADMIN")):
    await QuestionService.delete(db, question_id)
