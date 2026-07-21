from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_swagger_ui_theme import setup_swagger_ui_theme
from slowapi import _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.router import router as v1_router
from app.api.v1.router import setup as setup_v1_router
from app.core.exception_handlers import register_exception_handlers
from app.core.logging import logger
from app.core.rate_limiter import limiter
from app.core.settings import settings
from app.db.base import import_models
from app.domains.logs.services.log_service import LogService
from app.shared.middleware.http_logger_middleware import RequestLogMiddleware
from app.shared.middleware.security_headers_middleware import SecurityHeadersMiddleware

# Register models in Base.metadata (needed for Alembic)
import_models()

# Load domain routers (must happen after models are registered)
setup_v1_router()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação (startup e shutdown).

    Args:
        app: Instância da aplicação FastAPI.

    Yields:
        None: Mantém a aplicação em execução até o shutdown.
    """
    logger.info("Application startup")

    LogService.cleanup_old_logs()

    yield

    logger.info("Application shutdown")


app = FastAPI(
    title="Skill Radar API",
    description="Backend da plataforma Skill Radar para avaliação de competências",
    version="1.0.0",
    lifespan=lifespan,
    license_info={
        "name": "MIT",
        "identifier": "MIT",
    },
    docs_url=None,
)

app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecurityHeadersMiddleware)

register_exception_handlers(app)

app.add_middleware(RequestLogMiddleware)
app.add_middleware(SlowAPIMiddleware)

app.add_exception_handler(429, _rate_limit_exceeded_handler)

setup_swagger_ui_theme(app, docs_path="/docs")

app.include_router(v1_router)
