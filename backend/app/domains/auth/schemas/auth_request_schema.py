from pydantic import BaseModel, ConfigDict, Field


class LoginRequestSchema(BaseModel):
    """Esquema de requisição para autenticação via username ou e-mail."""

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )

    username: str = Field(
        ...,
        min_length=3,
        max_length=255,
        description="Nome de usuário ou e-mail",
        examples=["admin", "admin@example.com"],
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=255,
        description="Senha do usuário",
        examples=["admin123"],
    )


class RefreshTokenRequestSchema(BaseModel):
    """Esquema de requisição para refresh de token."""

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )

    refresh_token: str = Field(
        ...,
        description="Token de refresh para obter novos tokens",
    )


class ApiKeyAuthRequestSchema(BaseModel):
    """Esquema de requisição para autenticação via client_id e client_secret."""

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )

    client_id: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Identificador do cliente para autenticação na API",
        examples=["my-client-id"],
    )

    client_secret: str = Field(
        ...,
        min_length=8,
        max_length=255,
        description="Chave secreta do cliente para autenticação na API",
        examples=["my-super-secret-key"],
    )
