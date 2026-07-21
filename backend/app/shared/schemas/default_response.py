from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DefaultResponse(BaseModel):
    """Esquema de resposta padrão da API, utilizado por todos os endpoints."""

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )

    code: int = Field(..., description="Código de status da resposta", examples=[200])

    description: str = Field(
        ...,
        description="Descrição da mensagem de resposta",
        examples=["Request processed successfully"],
    )

    path: str = Field(..., description="Caminho da requisição", examples=["/health"])

    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="Momento da resposta",
        examples=["2026-05-09T18:30:00Z"],
    )

    data: Any | None = Field(
        description="Dados adicionais da resposta",
        default=None,
    )
