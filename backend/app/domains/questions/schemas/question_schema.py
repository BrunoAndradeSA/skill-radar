from __future__ import annotations  # noqa: I001

from pydantic import BaseModel, ConfigDict, Field

from datetime import datetime  # noqa: TC003


class AlternativeCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str | None = Field(
        default=None, description="Identificador temporário do frontend", exclude=True
    )
    text: str = Field(..., description="Texto da alternativa")
    is_correct: bool = Field(..., description="Se é a alternativa correta")


class AlternativeOut(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    id: int = Field(..., description="Identificador único")
    text: str = Field(..., description="Texto da alternativa")
    is_correct: bool | None = Field(default=None, description="Se é a alternativa correta")


class QuestionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    theme_id: int = Field(..., description="ID do tema", examples=[1])
    competency_ids: list[int] = Field(default=[], description="IDs das competências associadas")
    type: str = Field(
        default="NORMAL", pattern=r"^(NORMAL|CERTIFICATION)$", description="Tipo da questão"
    )
    seniority: str = Field(
        ..., pattern=r"^(Trainee|Júnior|Pleno|Sênior)$", description="Senioridade"
    )
    text: str = Field(..., min_length=1, description="Enunciado da questão em Markdown")
    explanation: str | None = Field(default=None, description="Explicação da resposta correta")
    alternatives: list[AlternativeCreate] = Field(
        ..., min_length=2, description="Lista de alternativas (mínimo 2)"
    )


class QuestionUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    theme_id: int = Field(..., description="ID do tema", examples=[1])
    competency_ids: list[int] = Field(default=[], description="IDs das competências associadas")
    type: str = Field(
        default="NORMAL", pattern=r"^(NORMAL|CERTIFICATION)$", description="Tipo da questão"
    )
    seniority: str = Field(
        ..., pattern=r"^(Trainee|Júnior|Pleno|Sênior)$", description="Senioridade"
    )
    text: str = Field(..., min_length=1, description="Enunciado da questão em Markdown")
    explanation: str | None = Field(default=None, description="Explicação da resposta correta")
    alternatives: list[AlternativeCreate] = Field(
        ..., min_length=2, description="Lista de alternativas (mínimo 2)"
    )


class QuestionOut(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    id: int = Field(..., description="Identificador único")
    theme_id: int = Field(..., description="ID do tema")
    competency_ids: list[int] = Field(default=[], description="IDs das competências")
    type: str = Field(..., description="Tipo da questão")
    seniority: str = Field(..., description="Senioridade")
    text: str = Field(..., description="Enunciado")
    explanation: str | None = Field(default=None, description="Explicação")
    alternatives: list[AlternativeOut] = Field(..., description="Alternativas")
    created_at: datetime = Field(..., description="Data de criação")
    updated_at: datetime = Field(..., description="Data da última atualização")
