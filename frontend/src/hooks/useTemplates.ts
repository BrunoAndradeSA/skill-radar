import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TemplateService } from '../services/template.service';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import type { ExamTemplate } from '../models/ExamTemplate';
import { useSnackbar } from './useSnackbar';

const templateService = new TemplateService(RepositoryFactory.getTemplateRepository());

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => templateService.getAllTemplates(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTemplateMutations() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const create = useMutation({
    mutationFn: (t: Omit<ExamTemplate, 'id'>) => templateService.createTemplate(t),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      showSnackbar('Template criado', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao criar template', 'error');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, template }: { id: string; template: Omit<ExamTemplate, 'id'> }) =>
      templateService.updateTemplate(id, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      showSnackbar('Template atualizado', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao atualizar template', 'error');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => templateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      showSnackbar('Template removido', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao remover template', 'error');
    },
  });

  return { create, update, remove };
}
