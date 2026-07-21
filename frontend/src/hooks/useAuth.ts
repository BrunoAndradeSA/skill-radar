import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { useUserStore } from '../store/useUserStore';

const authService = new AuthService(RepositoryFactory.getAuthRepository());

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUser, setTokens, logout: storeLogout } = useUserStore();

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const tokens = await authService.login(username, password);
      setTokens(tokens.accessToken, tokens.refreshToken);
      try {
        const user = await authService.getMe();
        setUser(user);
        return user;
      } catch {
        storeLogout();
        throw new Error('Falha ao carregar dados do usuário');
      }
    },
    onSuccess: () => {
      navigate('/admin/dashboard');
    },
  });

  const logout = () => {
    storeLogout();
    authService.logout().catch(() => {});
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    logout,
  };
}
