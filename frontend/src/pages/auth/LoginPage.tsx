import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { useAuth } from '../../hooks/useAuth';

function getLoginError(error: unknown): string {
  if (error instanceof Error && 'code' in error) {
    const code = (error as { code: string }).code;
    if (code === 'AUTH_ERROR') return 'Credenciais inválidas';
    if (code === 'USER_DISABLED') return 'Usuário desabilitado. Contate o administrador.';
  }
  return 'Erro ao autenticar. Tente novamente.';
}

const LoginPage: React.FC = () => {
  const { login, isLoading, error, isAuthenticated, user } = useAuth();
  const [sessionExpired] = useState(() => {
    const expired = sessionStorage.getItem('session_expired');
    if (expired) sessionStorage.removeItem('session_expired');
    return !!expired;
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthenticated && user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password });
  };

  return (
    <>
      {sessionExpired && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }}>
          Sessão expirada, realize o login novamente
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }}>
          {getLoginError(error)}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Usuário ou Email"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
          margin="normal"
          size="small"
        />
        <TextField
          fullWidth
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          margin="normal"
          size="small"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{
            mt: 2,
            py: 1.4,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </>
  );
};

export default LoginPage;
