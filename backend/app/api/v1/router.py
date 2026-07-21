from fastapi import APIRouter

from app.core.router_loader import load_domain_routers

router = APIRouter(prefix="/api/v1")


def setup() -> None:
    """Carrega dinamicamente os roteadores de todos os domínios registrados no router principal /api/v1."""
    load_domain_routers(router, version="v1")
