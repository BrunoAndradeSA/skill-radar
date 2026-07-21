from __future__ import annotations  # noqa: I001

from pydantic import BaseModel, ConfigDict, Field

from datetime import datetime  # noqa: TC003


class UserData(BaseModel):
    """Esquema com os dados de um usuário do sistema."""

    model_config = ConfigDict(
        extra="forbid",
        from_attributes=True,
    )

    id: int = Field(..., description="Identificador único do usuário", examples=[1])

    name: str = Field(..., description="Nome completo", examples=["John Doe"])

    email: str = Field(..., description="E-mail", examples=["user@example.com"])

    roles: list[str] = Field(default=[], description="Papéis do usuário", examples=[["ADMIN"]])

    enabled: bool = Field(default=True, description="Se está habilitado")

    created_at: datetime = Field(..., description="Data de criação")

    updated_at: datetime = Field(..., description="Data da última atualização")
