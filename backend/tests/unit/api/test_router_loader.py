from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from app.core.router_loader import load_domain_routers


class TestLoadDomainRouters:
    @pytest.fixture
    def mock_api_router(self):
        return MagicMock()

    def test_empty_domains_dir(self, mock_api_router, tmp_path):
        """Testa que diretório vazio não inclui nenhum router."""
        domains_dir = tmp_path / "domains"
        domains_dir.mkdir()

        with patch(
            "app.core.router_loader.Path",
        ) as mock_path_cls:
            mock_path_cls.__file__ = str(tmp_path / "dummy.py")
            mock_path_cls.return_value.resolve.return_value.parent.parent = tmp_path

            with patch("app.core.router_loader.importlib.import_module", return_value=None):
                load_domain_routers(mock_api_router, version="v1")

        mock_api_router.include_router.assert_not_called()

    def test_loads_router_from_domain(self, mock_api_router, tmp_path):
        """Testa que um domínio com router.py tem seu router incluído."""
        domains_dir = tmp_path / "domains"
        domains_dir.mkdir()

        domain_dir = domains_dir / "testdomain"
        domain_dir.mkdir()
        (domain_dir / "router.py").write_text(
            "from fastapi import APIRouter\nrouter = APIRouter()\n"
        )

        fake_router = MagicMock()

        def _import_module(path: str) -> MagicMock:
            if "testdomain" in path:
                mod = MagicMock()
                mod.router = fake_router
                return mod
            return MagicMock()

        with patch(
            "app.core.router_loader.Path",
        ) as mock_path_cls:
            mock_path_cls.return_value.resolve.return_value.parent.parent = tmp_path
            mock_path_cls.__file__ = str(Path(__file__).resolve())

            with patch(
                "app.core.router_loader.importlib.import_module", side_effect=_import_module
            ):
                load_domain_routers(mock_api_router, version="v1")

        mock_api_router.include_router.assert_called_once_with(fake_router)

    def test_skips_non_directories(self, mock_api_router, tmp_path):
        """Testa que arquivos (não diretórios) no diretório domains são ignorados."""
        domains_dir = tmp_path / "domains"
        domains_dir.mkdir()
        (domains_dir / "not_a_dir.py").write_text("")

        with patch(
            "app.core.router_loader.Path",
        ) as mock_path_cls:
            mock_path_cls.return_value.resolve.return_value.parent.parent = tmp_path
            mock_path_cls.__file__ = str(Path(__file__).resolve())

            with patch("app.core.router_loader.importlib.import_module"):
                load_domain_routers(mock_api_router, version="v1")

        mock_api_router.include_router.assert_not_called()

    def test_skips_domain_without_router_file(self, mock_api_router, tmp_path):
        """Testa que domínio sem router.py ou router_v2.py é ignorado."""
        domains_dir = tmp_path / "domains"
        domains_dir.mkdir()

        domain_dir = domains_dir / "empty_domain"
        domain_dir.mkdir()

        with patch(
            "app.core.router_loader.Path",
        ) as mock_path_cls:
            mock_path_cls.return_value.resolve.return_value.parent.parent = tmp_path
            mock_path_cls.__file__ = str(Path(__file__).resolve())

            with patch("app.core.router_loader.importlib.import_module"):
                load_domain_routers(mock_api_router, version="v1")

        mock_api_router.include_router.assert_not_called()

    def test_fallback_to_router_py_when_versioned_not_found(self, mock_api_router, tmp_path):
        """Testa que quando router_v2.py não existe, faz fallback para router.py."""
        domains_dir = tmp_path / "domains"
        domains_dir.mkdir()

        domain_dir = domains_dir / "mydomain"
        domain_dir.mkdir()
        (domain_dir / "router.py").write_text("")

        fake_router = MagicMock()

        def _import_module(path: str) -> MagicMock:
            if "mydomain.router" in path:
                mod = MagicMock()
                mod.router = fake_router
                return mod
            return MagicMock()

        with patch(
            "app.core.router_loader.Path",
        ) as mock_path_cls:
            mock_path_cls.return_value.resolve.return_value.parent.parent = tmp_path
            mock_path_cls.__file__ = str(Path(__file__).resolve())

            with patch(
                "app.core.router_loader.importlib.import_module", side_effect=_import_module
            ):
                load_domain_routers(mock_api_router, version="v2")

        mock_api_router.include_router.assert_called_once_with(fake_router)

    def test_skips_module_without_router_attr(self, mock_api_router, tmp_path):
        """Testa que módulo sem atributo 'router' é ignorado."""
        domains_dir = tmp_path / "domains"
        domains_dir.mkdir()

        domain_dir = domains_dir / "broken"
        domain_dir.mkdir()
        (domain_dir / "router.py").write_text("not_a_router = 42")

        with patch(
            "app.core.router_loader.Path",
        ) as mock_path_cls:
            mock_path_cls.return_value.resolve.return_value.parent.parent = tmp_path
            mock_path_cls.__file__ = str(Path(__file__).resolve())

            with patch("app.core.router_loader.importlib.import_module") as mock_import:
                mod = MagicMock()
                del mod.router
                mock_import.return_value = mod
                load_domain_routers(mock_api_router, version="v1")

        mock_api_router.include_router.assert_not_called()

    def test_loads_multiple_domains(self, mock_api_router, tmp_path):
        """Testa que múltiplos domínios com router são todos carregados."""
        domains_dir = tmp_path / "domains"
        domains_dir.mkdir()

        for name in ["auth", "health", "logs"]:
            d = domains_dir / name
            d.mkdir()
            (d / "router.py").write_text("")

        fake_routers = {}

        def _import_module(path: str) -> MagicMock:
            for domain_name in ["auth", "health", "logs"]:
                if domain_name in path:
                    if domain_name not in fake_routers:
                        fake_routers[domain_name] = MagicMock()
                    mod = MagicMock()
                    mod.router = fake_routers[domain_name]
                    return mod
            return MagicMock()

        with patch(
            "app.core.router_loader.Path",
        ) as mock_path_cls:
            mock_path_cls.return_value.resolve.return_value.parent.parent = tmp_path
            mock_path_cls.__file__ = str(Path(__file__).resolve())

            with patch(
                "app.core.router_loader.importlib.import_module", side_effect=_import_module
            ):
                load_domain_routers(mock_api_router, version="v1")

        assert mock_api_router.include_router.call_count == 3
