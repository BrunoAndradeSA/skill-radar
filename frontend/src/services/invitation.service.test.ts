import { describe, it, expect } from 'vitest';
import { InvitationService } from './invitation.service';
import { createMockInvitationRepository } from '../test/mocks';
import { ValidationError } from '../models/errors';

describe('InvitationService', () => {
  describe('createInvitation', () => {
    it('cria convite com dados válidos', async () => {
      const repo = createMockInvitationRepository();
      const service = new InvitationService(repo);
      const input = {
        templateId: '1',
        candidateName: 'João',
        candidateEmail: 'joao@teste.com',
        isExternal: false,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      repo.create.mockResolvedValue({ id: '1', ...input, token: 'abc', accessCode: 'XYZ', used: false, createdAt: new Date().toISOString() });

      const result = await service.createInvitation(input);
      expect(result.candidateName).toBe('João');
    });

    it('rejeita sem nome do candidato', async () => {
      const repo = createMockInvitationRepository();
      const service = new InvitationService(repo);
      await expect(service.createInvitation({ templateId: '1', candidateName: '', candidateEmail: 'joao@teste.com', isExternal: false, expiresAt: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita sem email do candidato', async () => {
      const repo = createMockInvitationRepository();
      const service = new InvitationService(repo);
      await expect(service.createInvitation({ templateId: '1', candidateName: 'João', candidateEmail: '', isExternal: false, expiresAt: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita sem templateId', async () => {
      const repo = createMockInvitationRepository();
      const service = new InvitationService(repo);
      await expect(service.createInvitation({ templateId: '', candidateName: 'João', candidateEmail: 'joao@teste.com', isExternal: false, expiresAt: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });
});
