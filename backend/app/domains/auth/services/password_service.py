from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


class PasswordService:
    """Serviço para hash e verificação de senhas usando argon2."""

    @staticmethod
    def hash_password(password: str) -> str:
        """Gera o hash argon2 da senha informada.

        Args:
            password: Senha em texto puro.

        Returns:
            str: Hash argon2 da senha.
        """
        return password_hash.hash(password)

    @staticmethod
    def verify_password(
        plain_password: str,
        hashed_password: str,
    ) -> bool:
        """Verifica se a senha informada corresponde ao hash armazenado.

        Args:
            plain_password: Senha em texto puro a ser verificada.
            hashed_password: Hash argon2 armazenado.

        Returns:
            bool: True se a senha corresponder ao hash, False caso contrário.
        """
        return password_hash.verify(
            plain_password,
            hashed_password,
        )
