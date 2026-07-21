import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Moon, Sun } from 'lucide-react';
import { useThemeMode } from '../hooks/useThemeMode';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { InvitationService } from '../services/invitation.service';

const PROTECTED_EXAM_ROUTES = ['/exam/rules', '/exam/start', '/exam/result'];

const invitationService = new InvitationService(
  RepositoryFactory.getInvitationRepository(),
);

const CandidateLayout: React.FC = () => {
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();
  const isProtectedRoute = PROTECTED_EXAM_ROUTES.includes(location.pathname);
  const [validating, setValidating] = useState(isProtectedRoute);
  const [isValid, setIsValid] = useState(!isProtectedRoute);
  const validatedRef = useRef(false);

  useEffect(() => {
    if (!isProtectedRoute) {
      validatedRef.current = false;
      return;
    }

    if (validatedRef.current) return;

    const token = sessionStorage.getItem('exam_token');
    if (!token) {
      validatedRef.current = true;
      navigate('/', { replace: true });
      return;
    }

    validatedRef.current = true;
    invitationService.getInvitationByToken(token)
      .then((invitation) => {
        if (!invitation) {
          sessionStorage.removeItem('exam_authenticated');
          sessionStorage.removeItem('exam_token');
          navigate('/', { replace: true });
        } else {
          setIsValid(true);
        }
      })
      .catch(() => {
        sessionStorage.removeItem('exam_authenticated');
        sessionStorage.removeItem('exam_token');
        navigate('/', { replace: true });
      })
      .finally(() => setValidating(false));
  }, [isProtectedRoute, navigate]);

  if (isProtectedRoute && validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)]">
        <CircularProgress />
      </div>
    );
  }

  if (isProtectedRoute && !isValid) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] transition-colors duration-300">
      <header className="h-14 glass dark:glass border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex items-center px-4 md:px-6 sticky top-0 z-10 flex-shrink-0">
        <div className="flex-1 flex items-center gap-3">
          <img src="/favicon.svg" alt="Skill Radar" className="w-7 h-7" />
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 font-heading">
            Skill Radar - Exame
          </span>
        </div>
        <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
          <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.secondary' }}>
            {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
        </Tooltip>
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        <div className="animate-fade-in flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CandidateLayout;
