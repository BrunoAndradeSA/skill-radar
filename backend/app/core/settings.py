from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações da aplicação carregadas de variáveis de ambiente ou arquivo .env."""

    app_name: str
    app_env: str

    api_v1_prefix: str

    postgres_host: str
    postgres_port: int
    postgres_db: str
    postgres_user: str
    postgres_password: str

    jwt_secret_key: str
    jwt_algorithm: str
    jwt_expire_minutes: int

    http_log_capture_response_body: bool
    http_log_max_body_size: int

    enable_mock_mode: bool = False
    enable_authentication: bool = True
    enable_email_sending: bool = True
    enable_focus_monitoring: bool = True
    enable_auto_termination: bool = True
    enable_audit_log: bool = True

    cors_origins: str = "http://localhost:3000"

    rate_limit_login: str = "5/minute"
    rate_limit_token: str = "5/minute"
    rate_limit_refresh: str = "10/minute"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
    )

    @property
    def database_url(self) -> str:
        """Monta a URL de conexão com o PostgreSQL usando asyncpg.

        Returns:
            str: URL de conexão no formato `postgresql+asyncpg://user:password@host:port/db`.
        """
        return (
            f"postgresql+asyncpg://"
            f"{self.postgres_user}:"
            f"{self.postgres_password}@"
            f"{self.postgres_host}:"
            f"{self.postgres_port}/"
            f"{self.postgres_db}"
        )


settings = Settings()  # type: ignore
