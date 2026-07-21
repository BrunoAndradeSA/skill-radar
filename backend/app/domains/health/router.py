from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.domains.health.schemas.health_ready_data_schema import HealthReadyData
from app.domains.health.services.health_service import HealthService
from app.shared.schemas.default_response import DefaultResponse

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)

DbSession = Annotated[
    AsyncSession,
    Depends(get_db_session),
]


@router.get(
    "/live",
    summary="Sonda de liveness",
    description="Verifica se a aplicação está em execução.",
    response_model=DefaultResponse,
    response_model_exclude_none=True,
    responses={
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "model": DefaultResponse,
            "description": "Serviço indisponível",
        }
    },
)
async def live(
    request: Request,
) -> DefaultResponse:
    """Endpoint de sonda de liveness — indica se a aplicação está em execução."""
    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Aplicação está ativa",
        path=str(request.url.path),
    )


@router.get(
    "/ready",
    summary="Sonda de readiness",
    description="Verifica se a aplicação está pronta para receber tráfego.",
    response_model=DefaultResponse,
    response_model_exclude_none=True,
    responses={
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "model": DefaultResponse,
            "description": "Banco de dados indisponível",
        }
    },
)
async def ready(
    request: Request,
    db: DbSession,
) -> DefaultResponse:
    """Endpoint de sonda de readiness — verifica se o banco de dados está acessível."""
    database_ok = await HealthService.check_database(db)

    if not database_ok:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Banco de dados indisponível",
        )

    return DefaultResponse(
        code=status.HTTP_200_OK,
        description="Aplicação está pronta",
        path=str(request.url.path),
        data=HealthReadyData(
            database="UP",
        ),
    )
