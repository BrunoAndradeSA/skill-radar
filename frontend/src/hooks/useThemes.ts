import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemeService } from '../services/theme.service';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import type { Theme } from '../models/Theme';
import { useSnackbar } from './useSnackbar';

const themeService = new ThemeService(RepositoryFactory.getThemeRepository());

export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: () => themeService.getAllThemes(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useThemeMutations() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const create = useMutation({
    mutationFn: (theme: Omit<Theme, 'id'>) => themeService.createTheme(theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      showSnackbar('Tema criado', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao criar tema', 'error');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, theme }: { id: string; theme: Omit<Theme, 'id'> }) =>
      themeService.updateTheme(id, theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      showSnackbar('Tema atualizado', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao atualizar tema', 'error');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => themeService.deleteTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      showSnackbar('Tema removido', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao remover tema', 'error');
    },
  });

  return { create, update, remove };
}
