import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CandidateService } from '../services/candidate.service';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import type { CreateEntity, UpdateEntity } from '../models/types';
import type { Candidate } from '../models/Candidate';
import { useSnackbar } from './useSnackbar';

const candidateService = new CandidateService(RepositoryFactory.getCandidateRepository());

export function useCandidates() {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: () => candidateService.getAllCandidates(),
    staleTime: 30 * 1000,
  });
}

export function useCandidateById(id: string | null) {
  return useQuery({
    queryKey: ['candidates', id],
    queryFn: () => candidateService.getCandidateById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCandidateMutations() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const create = useMutation({
    mutationFn: (data: CreateEntity<Candidate>) => candidateService.createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      showSnackbar('Candidato cadastrado', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao cadastrar candidato', 'error');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEntity<Candidate> }) =>
      candidateService.updateCandidate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      showSnackbar('Candidato atualizado', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao atualizar candidato', 'error');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => candidateService.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      showSnackbar('Candidato removido', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao remover candidato', 'error');
    },
  });

  return { create, update, remove };
}
