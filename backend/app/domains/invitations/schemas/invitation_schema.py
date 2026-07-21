from __future__ import annotations  # noqa: I001

from pydantic import BaseModel, ConfigDict, Field

from datetime import datetime  # noqa: TC003


class InvitationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    template_id: int = Field(..., description="ID do template", examples=[1])
    candidate_id: int | None = Field(default=None, description="ID do candidato (opcional)")
    candidate_name: str = Field(..., min_length=1, max_length=255, description="Nome do candidato")
    candidate_email: str = Field(..., max_length=255, description="Email do candidato")
    cargo: str | None = Field(default=None, max_length=100, description="Cargo")
    squad: str | None = Field(default=None, max_length=50, description="Squad")
    setor: str | None = Field(default=None, max_length=100, description="Setor")
    nivel: str | None = Field(default=None, max_length=50, description="Nível")
    expires_at: datetime = Field(..., description="Data de expiração (ISO 8601)")
    is_external: bool = Field(default=False, description="Se é candidato externo")


class InvitationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    candidate_name: str | None = Field(default=None, max_length=255)
    candidate_email: str | None = Field(default=None, max_length=255)
    cargo: str | None = Field(default=None, max_length=100)
    squad: str | None = Field(default=None, max_length=50)
    setor: str | None = Field(default=None, max_length=100)
    nivel: str | None = Field(default=None, max_length=50)
    expires_at: datetime | None = Field(default=None)
    used: bool | None = Field(default=None)
    is_external: bool | None = Field(default=None)


class ValidateInvitationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    token: str = Field(..., max_length=255, description="Token do convite")
    access_code: str = Field(..., max_length=255, description="Código de acesso")


class InvitationPublicOut(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    id: int = Field(..., description="Identificador único")
    template_id: int = Field(..., description="ID do template")
    selection_process_id: int | None = Field(default=None, description="ID do processo seletivo")
    candidate_id: int | None = Field(default=None, description="ID do candidato")
    candidate_name: str = Field(..., description="Nome do candidato")
    candidate_email: str = Field(..., description="Email do candidato")
    cargo: str | None = Field(default=None, description="Cargo")
    squad: str | None = Field(default=None, description="Squad")
    setor: str | None = Field(default=None, description="Setor")
    nivel: str | None = Field(default=None, description="Nível")
    expires_at: datetime = Field(..., description="Data de expiração")
    used: bool = Field(..., description="Se já foi utilizado")
    is_external: bool = Field(..., description="Se é candidato externo")
    created_at: datetime = Field(..., description="Data de criação")
    updated_at: datetime = Field(..., description="Data da última atualização")


class InvitationOut(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    id: int = Field(..., description="Identificador único")
    template_id: int = Field(..., description="ID do template")
    selection_process_id: int | None = Field(default=None, description="ID do processo seletivo")
    candidate_id: int | None = Field(default=None, description="ID do candidato")
    candidate_name: str = Field(..., description="Nome do candidato")
    candidate_email: str = Field(..., description="Email do candidato")
    cargo: str | None = Field(default=None, description="Cargo")
    squad: str | None = Field(default=None, description="Squad")
    setor: str | None = Field(default=None, description="Setor")
    nivel: str | None = Field(default=None, description="Nível")
    token: str = Field(..., description="Token único de acesso")
    access_code: str = Field(..., description="Código de acesso")
    expires_at: datetime = Field(..., description="Data de expiração")
    used: bool = Field(..., description="Se já foi utilizado")
    is_external: bool = Field(..., description="Se é candidato externo")
    created_at: datetime = Field(..., description="Data de criação")
    updated_at: datetime = Field(..., description="Data da última atualização")
