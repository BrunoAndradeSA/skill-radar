from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class UserCreateSchema(BaseModel):
    """Esquema de requisição para criação de um novo usuário do sistema.

    Usuários criados aqui têm credenciais de login e são gerenciados
    através da tabela ``users``. Dados de candidatos (cargo, setor,
    nivel, squad) devem ser criados via ``/api/v1/candidates``.
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nome completo do usuário",
        examples=["John Doe"],
    )

    email: str = Field(
        ...,
        min_length=5,
        max_length=255,
        description="E-mail do usuário",
        examples=["user@example.com"],
    )

    password: str | None = Field(
        default=None,
        min_length=3,
        max_length=255,
        description="Senha do usuário (opcional, necessário para login)",
        examples=["securePass123"],
    )

    roles: list[str] = Field(
        default=[],
        description="Lista de descrições de roles a serem atribuídas ao usuário",
        examples=[["ADMIN"]],
    )


class UserUpdateSchema(BaseModel):
    """Esquema de requisição para atualização de um usuário existente."""

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )

    name: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, min_length=5, max_length=255)
    password: str | None = Field(default=None, min_length=3, max_length=255)
