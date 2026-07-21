from __future__ import annotations  # noqa: I001

from pydantic import BaseModel, ConfigDict, Field

from app.domains.questions.schemas.question_schema import AlternativeOut

from datetime import datetime  # noqa: TC003


class AssessmentStart(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    invitation_id: int = Field(..., description="ID do convite")
    template_id: int = Field(..., description="ID do template")


class AnswerSubmit(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    question_id: int = Field(..., description="ID da questão")
    selected_alternative_id: int | None = Field(
        default=None, description="ID da alternativa selecionada"
    )
    time_spent_seconds: int = Field(default=0, ge=0, description="Tempo gasto na questão")


class SecurityMetricsUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    focus_lost_count: int = Field(default=0, ge=0, description="Contagem de perdas de foco")
    is_terminated: bool = Field(default=False, description="Se foi encerrado por segurança")


class AssessmentPatch(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    answers: list[AnswerSubmit] | None = Field(
        default=None, description="Respostas para salvar/corrigir"
    )
    status: str | None = Field(
        default=None,
        pattern=r"^(IN_PROGRESS|FINISHED|TERMINATED)$",
        description="Novo status da avaliação",
    )
    security_metrics: SecurityMetricsUpdate | None = Field(
        default=None, description="Métricas de segurança"
    )


class AssessmentQuestionOut(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: int = Field(..., description="ID do registro assessment_question")
    question_id: int = Field(..., description="ID da questão")
    theme_id: int = Field(..., description="ID do tema")
    theme_name: str = Field(..., description="Nome do tema")
    order: int = Field(..., description="Ordem de exibição")
    text: str = Field(..., description="Enunciado")
    type: str = Field(..., description="Tipo")
    seniority: str = Field(..., description="Senioridade")
    competency_ids: list[int] = Field(default=[], description="IDs das competências")
    explanation: str | None = Field(default=None, description="Explicação")
    alternatives: list[AlternativeOut] = Field(..., description="Alternativas")


class AssessmentAnswerOut(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question_id: int = Field(..., description="ID da questão")
    selected_alternative_id: int | None = Field(
        default=None, description="ID da alternativa selecionada"
    )
    is_correct: bool | None = Field(default=None, description="Se está correta")
    time_spent_seconds: int = Field(default=0, description="Tempo gasto")


class AssessmentTiming(BaseModel):
    model_config = ConfigDict(extra="forbid")

    start_time: datetime = Field(..., description="Início da avaliação")
    end_time: datetime | None = Field(default=None, description="Fim da avaliação")
    duration_seconds: int = Field(default=0, description="Duração total em segundos")


class AssessmentSecurity(BaseModel):
    model_config = ConfigDict(extra="forbid")

    focus_lost_count: int = Field(default=0, description="Violações de foco")
    is_terminated: bool = Field(default=False, description="Encerrado por segurança")


class AssessmentOut(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    id: int = Field(..., description="Identificador único")
    invitation_id: int = Field(..., description="ID do convite")
    template_id: int = Field(..., description="ID do template")
    status: str = Field(..., description="Status da avaliação")
    questions: list[AssessmentQuestionOut] = Field(default=[], description="Questões")
    answers: list[AssessmentAnswerOut] = Field(default=[], description="Respostas")
    timing: AssessmentTiming = Field(..., description="Informações de tempo")
    security_metrics: AssessmentSecurity = Field(..., description="Métricas de segurança")
    score: int | None = Field(default=None, description="Número de acertos")
    percentage: int | None = Field(default=None, description="Percentual de acertos")
    created_at: datetime = Field(..., description="Data de criação")
    updated_at: datetime = Field(..., description="Data da última atualização")
