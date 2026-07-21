from __future__ import annotations  # noqa: I001

from pydantic import BaseModel, ConfigDict, Field

from datetime import datetime  # noqa: TC003


class TemplateThemeCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    theme_id: int = Field(..., description="ID do tema", examples=[1])
    question_count: int = Field(..., gt=0, description="Quantidade de questões a sortear")
    competency_ids: list[int] = Field(default=[], description="IDs das competências para filtrar")


class TemplateCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    name: str = Field(..., min_length=1, max_length=255, description="Nome do template")
    description: str | None = Field(default=None, description="Descrição opcional")
    seniority: str = Field(
        ..., pattern=r"^(Trainee|Júnior|Pleno|Sênior)$", description="Senioridade"
    )
    duration_minutes: int = Field(..., gt=0, description="Duração em minutos")
    is_certification: bool = Field(default=False, description="Se é certificação")
    themes: list[TemplateThemeCreate] = Field(
        ..., min_length=1, description="Lista de temas do template"
    )


class TemplateUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    name: str = Field(..., min_length=1, max_length=255, description="Nome do template")
    description: str | None = Field(default=None, description="Descrição opcional")
    seniority: str = Field(
        ..., pattern=r"^(Trainee|Júnior|Pleno|Sênior)$", description="Senioridade"
    )
    duration_minutes: int = Field(..., gt=0, description="Duração em minutos")
    is_certification: bool = Field(default=False, description="Se é certificação")
    themes: list[TemplateThemeCreate] = Field(
        ..., min_length=1, description="Lista de temas do template"
    )


class TemplateThemeOut(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    id: int = Field(..., description="Identificador único")
    theme_id: int = Field(..., description="ID do tema")
    question_count: int = Field(..., description="Quantidade de questões")
    competency_ids: list[int] = Field(default=[], description="IDs das competências")


class TemplateOut(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    id: int = Field(..., description="Identificador único")
    name: str = Field(..., description="Nome do template")
    description: str | None = Field(default=None, description="Descrição opcional")
    seniority: str = Field(..., description="Senioridade")
    duration_minutes: int = Field(..., description="Duração em minutos")
    is_certification: bool = Field(..., description="Se é certificação")
    themes: list[TemplateThemeOut] = Field(..., description="Temas do template")
    created_at: datetime = Field(..., description="Data de criação")
    updated_at: datetime = Field(..., description="Data da última atualização")
