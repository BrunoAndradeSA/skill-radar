from __future__ import annotations  # noqa: I001

from pydantic import BaseModel, ConfigDict, Field

from datetime import datetime  # noqa: TC003


class CandidateData(BaseModel):
    """Esquema de resposta com os dados de um candidato."""

    model_config = ConfigDict(
        extra="forbid",
        from_attributes=True,
    )

    id: int = Field(..., description="Identificador único do candidato", examples=[1])

    name: str = Field(..., description="Nome completo", examples=["Ana Silva"])

    email: str = Field(..., description="E-mail", examples=["ana@example.com"])

    role: str = Field(..., description="Papel do candidato", examples=["CANDIDATE"])

    cargo: str = Field(default="", description="Cargo", examples=["Desenvolvedor"])

    setor: str = Field(default="", description="Setor", examples=["Desenvolvimento"])

    nivel: str = Field(default="", description="Nível", examples=["Pleno"])

    squad: str = Field(default="", description="Squad", examples=["Squad 1"])

    created_at: datetime = Field(..., description="Data de criação")

    updated_at: datetime = Field(..., description="Data da última atualização")
