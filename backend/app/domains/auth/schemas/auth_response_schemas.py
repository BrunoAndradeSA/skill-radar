from pydantic import BaseModel, ConfigDict, Field

from app.domains.users.schemas.user_response_schema import UserData


class TokenResponseSchema(BaseModel):
    """Esquema de resposta com o token JWT gerado na autenticação."""

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )

    access_token: str = Field(
        ...,
        description="Token JWT de acesso para requisições autenticadas",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."],
    )

    refresh_token: str | None = Field(
        default=None,
        description="Token de refresh para obter novos access tokens",
    )

    token_type: str = Field(
        default="Bearer",
        description="Tipo do token de autenticação",
        examples=["Bearer"],
    )

    user: UserData | None = Field(
        default=None,
        description="Dados do usuário autenticado",
    )


class RefreshTokenResponseSchema(BaseModel):
    """Esquema de resposta para refresh de token."""

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )

    access_token: str = Field(
        ...,
        description="Novo token JWT de acesso",
    )

    refresh_token: str = Field(
        ...,
        description="Novo token de refresh",
    )
