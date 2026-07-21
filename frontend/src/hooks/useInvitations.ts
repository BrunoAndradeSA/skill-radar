import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InvitationService } from '../services/invitation.service';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import type { CreateInvitation } from '../repositories/interfaces/InvitationRepository';
import { useSnackbar } from './useSnackbar';

const invitationService = new InvitationService(RepositoryFactory.getInvitationRepository());

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: () => invitationService.getAllInvitations(),
    staleTime: 30 * 1000,
  });
}

export function useInvitationsByEmail(email: string | null) {
  return useQuery({
    queryKey: ['invitations', 'byEmail', email],
    queryFn: () => invitationService.findInvitationsByEmail(email!),
    enabled: !!email,
    staleTime: 30 * 1000,
  });
}

export function useInvitationMutations() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const create = useMutation({
    mutationFn: (inv: CreateInvitation) => invitationService.createInvitation(inv),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      showSnackbar('Convite criado', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao criar convite', 'error');
    },
  });

  return { create };
}
