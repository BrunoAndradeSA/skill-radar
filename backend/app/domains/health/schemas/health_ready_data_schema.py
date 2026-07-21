from __future__ import annotations

from pydantic import BaseModel


class HealthReadyData(BaseModel):
    """Esquema com dados do health check, indicando o status do banco de dados."""

    database: str
