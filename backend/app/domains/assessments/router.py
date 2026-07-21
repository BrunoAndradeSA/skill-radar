from __future__ import annotations

from typing import Annotated

import jwt as pyjwt
from fastapi import (
    APIRouter,
    Depends,
    Header,
    Query,
    Request,
    Security,
    status,
)
from fastapi.security import HTTPAuthorizationCredentials
from jwt.exceptions import PyJWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.settings import settings
from app.domains.assessments.schemas.assessment_schema import (
    AssessmentOut,
    AssessmentPatch,
    AssessmentStart,
)
from app.domains.assessments.schemas.stats_schema import GeneralStats, GroupStats
from app.domains.assessments.services.assessment_service import AssessmentService
from app.domains.auth.dependencies import require_role, security_scheme
from app.domains.invitations.repositories.invitation_repository import InvitationRepository
from app.shared.schemas.default_response import DefaultResponse

router = APIRouter(prefix="/assessments", tags=["Assessments"])

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.get(
    "/stats",
    summary="Estatísticas gerais ou por grupo",
    response_model=GeneralStats | GroupStats,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        }
    },
)
async def get_stats(
    db: DbSession,
    group_by: str | None = Query(
        default=None, description="Agrupar por: cargo, nivel, squad, setor"
    ),
    group_value: str | None = Query(default=None, description="Valor do grupo"),
    _auth: None = require_role("ADMIN"),
):
    if group_by and group_value:
        return await AssessmentService.get_group_stats(db, group_by, group_value)
    return await AssessmentService.get_general_stats(db)


@router.get(
    "",
    summary="Listar avaliações",
    response_model=list[AssessmentOut],
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token ausente, inválido ou permissão insuficiente",
        }
    },
)
async def list_assessments(
    db: DbSession,
    is_external: bool | None = Query(default=None, description="Filtrar por externo"),
    invitation_ids: str | None = Query(
        default=None, description="Filtrar por IDs de convite (separados por vírgula)"
    ),
    _auth: None = require_role("ADMIN"),
):
    parsed_ids: list[int] | None = None
    if invitation_ids:
        parsed_ids = [int(x) for x in invitation_ids.split(",") if x.strip()]
    return await AssessmentService.get_all(db, is_external=is_external, invitation_ids=parsed_ids)


@router.get(
    "/{assessment_id}",
    summary="Obter avaliação por ID",
    response_model=AssessmentOut,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token de admin ou token do convite necessário",
        },
        status.HTTP_403_FORBIDDEN: {
            "model": DefaultResponse,
            "description": "Token do convite não corresponde à avaliação",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Avaliação não encontrada",
        },
    },
)
async def get_assessment(
    assessment_id: int,
    db: DbSession,
    invitation_token: str | None = Header(default=None, alias="X-Invitation-Token"),
    credentials: HTTPAuthorizationCredentials | None = Security(security_scheme),
):
    if invitation_token:
        assessment = await AssessmentService.get_by_id(db, assessment_id)
        inv_repo = InvitationRepository(db)
        invitation = await inv_repo.get_by_id(assessment.invitation_id)
        if invitation is None or invitation.token != invitation_token:
            raise ForbiddenError("Token do convite não corresponde a esta avaliação")
        return assessment

    if credentials is None:
        raise UnauthorizedError("Token de autenticação ou token do convite necessário")

    try:
        payload = pyjwt.decode(
            credentials.credentials, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
    except PyJWTError:
        raise UnauthorizedError("Token inválido ou expirado") from None

    if "ADMIN" not in payload.get("roles", []):
        raise UnauthorizedError("Permissões insuficientes")

    return await AssessmentService.get_by_id(db, assessment_id)


@router.get(
    "/invitation/{invitation_id}",
    summary="Obter avaliação por invitationId",
    response_model=AssessmentOut,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Avaliação não encontrada para este convite",
        }
    },
)
async def get_assessment_by_invitation(invitation_id: int, db: DbSession):
    return await AssessmentService.get_by_invitation(db, invitation_id)


@router.post(
    "",
    summary="Iniciar avaliação",
    status_code=status.HTTP_201_CREATED,
    response_model=DefaultResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": DefaultResponse,
            "description": "Dados inválidos para iniciar avaliação",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Convite não encontrado",
        },
    },
)
async def start_assessment(request: Request, data: AssessmentStart, db: DbSession):
    assessment = await AssessmentService.start(db, data)
    return DefaultResponse(
        code=status.HTTP_201_CREATED,
        description="Avaliação iniciada com sucesso",
        path=str(request.url.path),
        data=assessment,
    )


@router.patch(
    "/{assessment_id}",
    summary="Salvar respostas e/ou finalizar",
    response_model=DefaultResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": DefaultResponse,
            "description": "Dados inválidos para atualização",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": DefaultResponse,
            "description": "Token do convite inválido ou ausente",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": DefaultResponse,
            "description": "Avaliação não encontrada",
        },
    },
)
async def patch_assessment(
    request: Request,
    assessment_id: int,
    data: AssessmentPatch,
    db: DbSession,
    invitation_token: str = Header(..., alias="X-Invitation-Token"),
):
    assessment = await AssessmentService.patch(db, assessment_id, data, invitation_token)
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Avaliação atualizada com sucesso",
        path=str(request.url.path),
        data=assessment,
    )
