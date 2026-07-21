from pydantic import BaseModel, ConfigDict, Field  # noqa: I001

from datetime import datetime  # noqa: TC003


class CompetencyCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    theme_id: int = Field(..., description="ID do tema pai", examples=[1])
    name: str = Field(
        ..., min_length=1, max_length=255, description="Nome da competência", examples=["FastAPI"]
    )
    description: str | None = Field(default=None, description="Descrição opcional")


class CompetencyUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    theme_id: int = Field(..., description="ID do tema pai", examples=[1])
    name: str = Field(
        ..., min_length=1, max_length=255, description="Nome da competência", examples=["FastAPI"]
    )
    description: str | None = Field(default=None, description="Descrição opcional")


class CompetencyOut(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    id: int = Field(..., description="Identificador único")
    theme_id: int = Field(..., description="ID do tema pai")
    name: str = Field(..., description="Nome da competência")
    description: str | None = Field(default=None, description="Descrição opcional")
    created_at: datetime = Field(..., description="Data de criação")
    updated_at: datetime = Field(..., description="Data da última atualização")
