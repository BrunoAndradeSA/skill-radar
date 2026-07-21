from __future__ import annotations

import importlib
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from fastapi import APIRouter


def load_domain_routers(
    api_router: APIRouter,
    version: str,
) -> None:
    """Descobre e registra automaticamente os roteadores de cada domínio no diretório `domains/`.

    Args:
        api_router: Roteador FastAPI onde os roteadores de domínio serão incluídos.
        version: Versão da API usada para determinar o nome do módulo do roteador.
    """
    domains_path = Path(__file__).resolve().parent.parent / "domains"

    for domain_dir in domains_path.iterdir():
        if not domain_dir.is_dir():
            continue

        router_module_name = "router" if version == "v1" else f"router_{version}"

        router_file = domain_dir / f"{router_module_name}.py"

        # fallback para router.py
        if not router_file.exists():
            router_module_name = "router"
            router_file = domain_dir / "router.py"

        if not router_file.exists():
            continue

        module_path = f"app.domains.{domain_dir.name}.{router_module_name}"

        module = importlib.import_module(module_path)

        router = getattr(module, "router", None)

        if router:
            api_router.include_router(router)
