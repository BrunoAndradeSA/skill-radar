from pydantic import BaseModel, ConfigDict, Field  # noqa: I001

from datetime import datetime  # noqa: TC003


class ThemeCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    name: str = Field(
        ..., min_length=1, max_length=255, description="Nome do tema", examples=["Python"]
    )
    description: str | None = Field(default=None, description="Descrição opcional do tema")


class ThemeUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    name: str = Field(
        ..., min_length=1, max_length=255, description="Nome do tema", examples=["Python"]
    )
    description: str | None = Field(default=None, description="Descrição opcional do tema")


class ThemeOut(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    id: int = Field(..., description="Identificador único do tema")
    name: str = Field(..., description="Nome do tema")
    description: str | None = Field(default=None, description="Descrição opcional")
    created_at: datetime = Field(..., description="Data de criação")
    updated_at: datetime = Field(..., description="Data da última atualização")
