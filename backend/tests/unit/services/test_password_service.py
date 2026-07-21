from __future__ import annotations

import pytest

from app.domains.auth.services.password_service import PasswordService


class TestPasswordService:
    def test_hash_password_returns_string(self):
        """Testa que hash_password retorna uma string não vazia."""
        hashed = PasswordService.hash_password("my_secret_password")
        assert isinstance(hashed, str)
        assert len(hashed) > 0

    def test_hash_password_produces_different_hashes(self):
        """Testa que hashes da mesma senha são diferentes devido ao salt."""
        h1 = PasswordService.hash_password("password")
        h2 = PasswordService.hash_password("password")
        assert h1 != h2

    def test_verify_password_correct(self):
        """Testa que verify_password retorna True para a senha correta."""
        plain = "correct_password"
        hashed = PasswordService.hash_password(plain)
        assert PasswordService.verify_password(plain, hashed) is True

    def test_verify_password_wrong(self):
        """Testa que verify_password retorna False para senha incorreta."""
        hashed = PasswordService.hash_password("correct_password")
        assert PasswordService.verify_password("wrong_password", hashed) is False

    def test_verify_password_with_invalid_hash(self):
        """Testa que verify_password levanta UnknownHashError para hash inválido."""
        from pwdlib.exceptions import UnknownHashError

        with pytest.raises(UnknownHashError):
            PasswordService.verify_password("any", "not-a-valid-hash")

    def test_verify_password_empty_string(self):
        """Testa que verify_password retorna False para senha vazia."""
        hashed = PasswordService.hash_password("something")
        assert PasswordService.verify_password("", hashed) is False

    @pytest.mark.parametrize(
        ("password",),
        [
            ("a",),
            ("short",),
            ("a" * 100,),
        ],
    )
    def test_hash_password_various_lengths(self, password: str):
        """Testa que hash_password funciona com senhas de diferentes tamanhos."""
        hashed = PasswordService.hash_password(password)
        assert PasswordService.verify_password(password, hashed) is True
