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
    <div className="stagger">
      {/* Desktop header */}
      <div className="hidden md:flex flex-col items-center mb-8">
        <div className="w-13 h-13 rounded-full bg-gradient-to-br from-[#0d9488] to-[#06b6d4] flex items-center justify-center mb-3.5 shadow-lg shadow-teal-500/20">
          <img src="/icon.svg" alt="Skill Radar" className="w-7 h-7 text-white" />
        </div>
        <span className="text-xl font-heading font-bold tracking-tight text-gray-800 dark:text-gray-100">
          Skill Radar
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Plataforma de Assessment
        </span>
      </div>

      <div className="text-center mb-7">
        <h1 className="text-[1.375rem] font-heading font-bold tracking-tight text-gray-800 dark:text-gray-100">
          Acessar plataforma
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Insira suas credenciais para continuar
        </p>
      </div>

      {sessionExpired && (
        <div className="animate-fade-in mb-4">
          <Alert
            severity="warning"
            sx={{
              borderRadius: 2,
              fontSize: '0.8125rem',
              py: 0.6,
              '& .MuiAlert-message': { padding: '4px 0' },
            }}
          >
            Sessão expirada. Faça login novamente.
          </Alert>
        </div>
      )}

      {error && (
        <div className="animate-fade-in mb-4">
          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
              fontSize: '0.8125rem',
              py: 0.6,
              '& .MuiAlert-message': { padding: '4px 0' },
            }}
          >
            {getLoginError(error)}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wide uppercase">
            Usuário ou Email
          </label>
          <TextField
            fullWidth
            placeholder="seu@email.com"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'transparent',
                fontSize: '0.875rem',
              },
            }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wide uppercase">
            Senha
          </label>
          <TextField
            fullWidth
            placeholder="• • • • • • • •"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'transparent',
                fontSize: '0.875rem',
              },
            }}
          />
        </div>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{
            mt: 0.5,
            py: 1.3,
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.875rem',
            background: 'linear-gradient(135deg, #0d9488, #0891b2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0f766e, #0e7490)',
              boxShadow: '0 8px 25px rgba(13, 148, 136, 0.25)',
            },
          }}
        >
          {isLoading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
        Ambiente seguro · Assessment Técnico
      </p>
    </div>
  );
};

export default LoginPage;
