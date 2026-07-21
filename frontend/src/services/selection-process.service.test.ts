import { describe, it, expect } from 'vitest';
import { SelectionProcessService } from './selection-process.service';
import { createMockSelectionProcessRepository } from '../test/mocks';
import { ValidationError } from '../models/errors';

describe('SelectionProcessService', () => {
  describe('create', () => {
    it('cria processo com dados válidos', async () => {
      const repo = createMockSelectionProcessRepository();
      const service = new SelectionProcessService(repo);
      const input = {
        name: 'Processo Teste',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        cargo: 'Desenvolvedor',
        nivel: 'Pleno',
        setor: 'Desenvolvimento',
        squad: 'Squad 1',
        templateId: '1',
        candidates: [{ name: 'João', email: 'joao@test.com' }],
      };
      repo.create.mockResolvedValue({ id: '1', ...input, totalInvitations: 1, totalFinished: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

      const result = await service.create(input);
      expect(result.name).toBe('Processo Teste');
      expect(result.totalInvitations).toBe(1);
    });

    it('rejeita sem nome', async () => {
      const repo = createMockSelectionProcessRepository();
      const service = new SelectionProcessService(repo);
      await expect(service.create({ name: '', startDate: '', endDate: '', cargo: '', nivel: '', setor: '', squad: '', templateId: '1', candidates: [] })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita sem templateId', async () => {
      const repo = createMockSelectionProcessRepository();
      const service = new SelectionProcessService(repo);
      await expect(service.create({ name: 'Teste', startDate: '', endDate: '', cargo: '', nivel: '', setor: '', squad: '', templateId: '', candidates: [] })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('addCandidates', () => {
    it('adiciona candidatos com dados válidos', async () => {
      const repo = createMockSelectionProcessRepository();
      const service = new SelectionProcessService(repo);
      repo.addCandidates.mockResolvedValue({ id: '1', name: 'Teste', startDate: '', endDate: '', cargo: '', nivel: '', setor: '', squad: '', templateId: '1', totalInvitations: 2, totalFinished: 0, createdAt: '', updatedAt: '' });

      const result = await service.addCandidates('1', [{ name: 'Maria', email: 'maria@test.com' }]);
      expect(result.totalInvitations).toBe(2);
    });

    it('rejeita lista vazia', async () => {
      const repo = createMockSelectionProcessRepository();
      const service = new SelectionProcessService(repo);
      await expect(service.addCandidates('1', [])).rejects.toThrow(ValidationError);
      expect(repo.addCandidates).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('retorna lista de processos', async () => {
      const repo = createMockSelectionProcessRepository();
      const service = new SelectionProcessService(repo);
      repo.findAll.mockResolvedValue([{ id: '1', name: 'Teste', startDate: '', endDate: '', cargo: '', nivel: '', setor: '', squad: '', templateId: '1', totalInvitations: 0, totalFinished: 0, createdAt: '', updatedAt: '' }]);

      const result = await service.getAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Teste');
    });
  });

  describe('getRankings', () => {
    it('retorna ranking', async () => {
      const repo = createMockSelectionProcessRepository();
      const service = new SelectionProcessService(repo);
      repo.getRankings.mockResolvedValue([{ invitationId: '1', candidateName: 'João', candidateEmail: 'joao@test.com', score: 8, percentage: 80, status: 'FINISHED', finished: true }]);

      const result = await service.getRankings('1');
      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(8);
    });
  });

  describe('delete', () => {
    it('exclui processo', async () => {
      const repo = createMockSelectionProcessRepository();
      const service = new SelectionProcessService(repo);
      repo.delete.mockResolvedValue(undefined);

      await service.delete('1');
      expect(repo.delete).toHaveBeenCalledWith('1');
    });
  });
});
