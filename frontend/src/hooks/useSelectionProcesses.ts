import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateSelectionProcess } from '../repositories/interfaces/SelectionProcessRepository';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { SelectionProcessService } from '../services/selection-process.service';
import type { CandidateInput } from '../models/SelectionProcess';
import { useSnackbar } from './useSnackbar';

const service = new SelectionProcessService(RepositoryFactory.getSelectionProcessRepository());

export function useSelectionProcesses() {
  return useQuery({
    queryKey: ['selection-processes'],
    queryFn: () => service.getAll(),
    staleTime: 30_000,
  });
}

export function useSelectionProcess(id: string | null) {
  return useQuery({
    queryKey: ['selection-processes', id],
    queryFn: () => service.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useSelectionProcessRankings(id: string | null) {
  return useQuery({
    queryKey: ['selection-processes', id, 'rankings'],
    queryFn: () => service.getRankings(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useSelectionProcessMutations() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const create = useMutation({
    mutationFn: (data: CreateSelectionProcess) => service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selection-processes'] });
      showSnackbar('Processo seletivo criado', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao criar processo', 'error');
    },
  });

  const addCandidates = useMutation({
    mutationFn: ({ id, candidates }: { id: string; candidates: CandidateInput[] }) =>
      service.addCandidates(id, candidates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['selection-processes'] });
      queryClient.invalidateQueries({ queryKey: ['selection-processes', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['selection-processes', variables.id, 'rankings'] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      showSnackbar('Candidato(s) adicionado(s)', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao adicionar candidato(s)', 'error');
    },
  });

  const deleteProcess = useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selection-processes'] });
      showSnackbar('Processo seletivo removido', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao remover processo', 'error');
    },
  });

  return { create, addCandidates, deleteProcess };
}
