from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class CandidateCreateSchema(BaseModel):
    """Esquema de requisição para criação de um novo candidato."""

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nome completo do candidato",
        examples=["Ana Silva"],
    )

    email: str = Field(
        ...,
        max_length=255,
        description="E-mail do candidato",
        examples=["ana@example.com"],
    )

    role: str = Field(
        default="CANDIDATE",
        pattern=r"^(CANDIDATE|USER)$",
        description="Papel do candidato",
        examples=["CANDIDATE"],
    )

    cargo: str = Field(
        ...,
        max_length=100,
        description="Cargo do candidato",
        examples=["Desenvolvedor"],
    )

    setor: str = Field(
        ...,
        max_length=100,
        description="Setor do candidato",
        examples=["Desenvolvimento"],
    )

    nivel: str = Field(
        ...,
        max_length=50,
        description="Nível do candidato",
        examples=["Pleno"],
    )

    squad: str = Field(
        ...,
        max_length=50,
        description="Squad do candidato",
        examples=["Squad 1"],
    )


class CandidateUpdateSchema(BaseModel):
    """Esquema de requisição para atualização de um candidato existente."""

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )

    name: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=255)
    role: str | None = Field(default=None, pattern=r"^(CANDIDATE|USER)$")
    cargo: str | None = Field(default=None, max_length=100)
    setor: str | None = Field(default=None, max_length=100)
    nivel: str | None = Field(default=None, max_length=50)
    squad: str | None = Field(default=None, max_length=50)
