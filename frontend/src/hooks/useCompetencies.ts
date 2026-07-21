import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CompetencyService } from '../services/competency.service';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import type { Competency } from '../models/Competency';
import { useSnackbar } from './useSnackbar';

const competencyService = new CompetencyService(RepositoryFactory.getCompetencyRepository());

export function useCompetencies(themeId?: string) {
  return useQuery({
    queryKey: ['competencies', themeId],
    queryFn: () => competencyService.getAllCompetencies(themeId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompetencyMutations() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const create = useMutation({
    mutationFn: (item: Omit<Competency, 'id'>) => competencyService.createCompetency(item),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['competencies', variables.themeId] });
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
      showSnackbar('Competência criada', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao criar competência', 'error');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, competency }: { id: string; competency: Omit<Competency, 'id'> }) =>
      competencyService.updateCompetency(id, competency),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['competencies', variables.competency.themeId] });
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
      showSnackbar('Competência atualizada', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao atualizar competência', 'error');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => competencyService.deleteCompetency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
      showSnackbar('Competência removida', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao remover competência', 'error');
    },
  });

  return { create, update, remove };
}
