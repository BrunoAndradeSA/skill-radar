from __future__ import annotations

from datetime import datetime, timedelta
from unittest.mock import patch

import pytest

from app.core.exceptions import BadRequestError, NotFoundError
from app.domains.logs.services.log_service import LogService


class TestGetLogsByDate:
    def test_today_log_file(self, tmp_path):
        """Testa a leitura do arquivo de log do dia atual."""
        log_file = tmp_path / "app.log"
        log_file.write_text("line1\nline2\nline3\n", encoding="utf-8")

        today_str = datetime.now().strftime("%Y-%m-%d")

        with patch("app.domains.logs.services.log_service.LOG_FOLDER", tmp_path):
            response = LogService.get_logs_by_date(today_str)

        assert response.filename == "app.log"
        assert response.content == ["line1", "line2", "line3"]

    def test_past_date_log_file(self, tmp_path):
        """Testa a leitura do arquivo de log de uma data passada."""
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        log_file = tmp_path / f"app.log.{yesterday}"
        log_file.write_text("log line\nanother line\n", encoding="utf-8")

        with patch("app.domains.logs.services.log_service.LOG_FOLDER", tmp_path):
            response = LogService.get_logs_by_date(yesterday)

        assert response.filename == f"app.log.{yesterday}"
        assert response.content == ["log line", "another line"]

    def test_invalid_date_format(self):
        """Testa que BadRequestError é levantado para formato de data inválido."""
        with pytest.raises(BadRequestError, match="Formato de data inválido"):
            LogService.get_logs_by_date("not-a-date")

    def test_wrong_format(self):
        """Testa que BadRequestError é levantado para formato de data incorreto (DD-MM-YYYY)."""
        with pytest.raises(BadRequestError, match="Formato de data inválido"):
            LogService.get_logs_by_date("20-05-2026")

    def test_file_not_found(self, tmp_path):
        """Testa que NotFoundError é levantado quando o arquivo de log não existe."""
        with (
            patch("app.domains.logs.services.log_service.LOG_FOLDER", tmp_path),
            pytest.raises(NotFoundError, match="Arquivo de log não encontrado"),
        ):
            LogService.get_logs_by_date("2020-01-01")

    def test_empty_log_file(self, tmp_path):
        """Testa a leitura de um arquivo de log vazio."""
        today_str = datetime.now().strftime("%Y-%m-%d")
        log_file = tmp_path / "app.log"
        log_file.write_text("", encoding="utf-8")

        with patch("app.domains.logs.services.log_service.LOG_FOLDER", tmp_path):
            response = LogService.get_logs_by_date(today_str)

        assert response.content == []


class TestCleanupOldLogs:
    def test_removes_old_log_files(self, tmp_path):
        """Testa que arquivos de log antigos são removidos pelo cleanup."""
        old_date = (datetime.now() - timedelta(days=20)).strftime("%Y-%m-%d")
        old_file = tmp_path / f"{old_date}.log"
        old_file.write_text("old content", encoding="utf-8")

        recent_date = (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d")
        recent_file = tmp_path / f"{recent_date}.log"
        recent_file.write_text("recent content", encoding="utf-8")

        with patch("app.domains.logs.services.log_service.LOG_FOLDER", tmp_path):
            LogService.cleanup_old_logs()

        assert not old_file.exists()
        assert recent_file.exists()

    def test_keeps_recent_log_files(self, tmp_path):
        """Testa que arquivos de log recentes são mantidos após o cleanup."""
        recent_date = (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d")
        recent_file = tmp_path / f"{recent_date}.log"
        recent_file.write_text("content", encoding="utf-8")

        with patch("app.domains.logs.services.log_service.LOG_FOLDER", tmp_path):
            LogService.cleanup_old_logs()

        assert recent_file.exists()

    def test_no_log_files(self, tmp_path):
        """Testa que cleanup_old_logs não falha quando não há arquivos de log."""
        with patch("app.domains.logs.services.log_service.LOG_FOLDER", tmp_path):
            LogService.cleanup_old_logs()

    def test_ignores_files_with_invalid_date_names(self, tmp_path):
        """Testa que arquivos com nomes que não são datas válidas são ignorados."""
        bad_file = tmp_path / "not-a-date.log"
        bad_file.write_text("content", encoding="utf-8")

        with patch("app.domains.logs.services.log_service.LOG_FOLDER", tmp_path):
            LogService.cleanup_old_logs()

        assert bad_file.exists()

    def test_removes_only_log_files(self, tmp_path):
        """Testa que apenas arquivos com extensão .log são removidos na limpeza."""
        old_date = (datetime.now() - timedelta(days=20)).strftime("%Y-%m-%d")
        old_log = tmp_path / f"{old_date}.log"
        old_log.write_text("old", encoding="utf-8")
        other_file = tmp_path / f"{old_date}.txt"
        other_file.write_text("keep", encoding="utf-8")

        with patch("app.domains.logs.services.log_service.LOG_FOLDER", tmp_path):
            LogService.cleanup_old_logs()

        assert not old_log.exists()
        assert other_file.exists()
