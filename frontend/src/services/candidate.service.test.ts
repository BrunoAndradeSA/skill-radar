import { describe, it, expect } from 'vitest';
import { CandidateService } from './candidate.service';
import { createMockCandidateRepository, sampleCandidate } from '../test/mocks';
import { ValidationError } from '../models/errors';

describe('CandidateService', () => {
  describe('createCandidate', () => {
    it('cria candidato com dados válidos', async () => {
      const repo = createMockCandidateRepository();
      const service = new CandidateService(repo);
      const input = {
        name: 'João',
        email: 'joao@teste.com',
        cargo: 'Desenvolvedor',
        setor: 'Desenvolvimento',
        nivel: 'Pleno',
        squad: 'Squad 1',
      };
      repo.create.mockResolvedValue({ id: '1', ...input });

      const result = await service.createCandidate(input);
      expect(result.name).toBe('João');
    });

    it('rejeita sem nome', async () => {
      const repo = createMockCandidateRepository();
      const service = new CandidateService(repo);
      await expect(service.createCandidate({ ...sampleCandidate, name: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita sem email', async () => {
      const repo = createMockCandidateRepository();
      const service = new CandidateService(repo);
      await expect(service.createCandidate({ ...sampleCandidate, email: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita sem cargo', async () => {
      const repo = createMockCandidateRepository();
      const service = new CandidateService(repo);
      await expect(service.createCandidate({ ...sampleCandidate, cargo: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita sem setor', async () => {
      const repo = createMockCandidateRepository();
      const service = new CandidateService(repo);
      await expect(service.createCandidate({ ...sampleCandidate, setor: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita sem nivel', async () => {
      const repo = createMockCandidateRepository();
      const service = new CandidateService(repo);
      await expect(service.createCandidate({ ...sampleCandidate, nivel: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita sem squad', async () => {
      const repo = createMockCandidateRepository();
      const service = new CandidateService(repo);
      await expect(service.createCandidate({ ...sampleCandidate, squad: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('updateCandidate', () => {
    it('valida nome não vazio', async () => {
      const repo = createMockCandidateRepository();
      const service = new CandidateService(repo);
      await expect(service.updateCandidate('1', { name: '' })).rejects.toThrow(ValidationError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('atualiza com nome válido', async () => {
      const repo = createMockCandidateRepository();
      const service = new CandidateService(repo);
      repo.update.mockResolvedValue({ ...sampleCandidate, name: 'Novo Nome' });
      const result = await service.updateCandidate('1', { name: 'Novo Nome' });
      expect(result.name).toBe('Novo Nome');
    });
  });

  describe('deleteCandidate', () => {
    it('delega para o repositório', async () => {
      const repo = createMockCandidateRepository();
      const service = new CandidateService(repo);
      repo.delete.mockResolvedValue(undefined);
      await service.deleteCandidate('1');
      expect(repo.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('findByEmail', () => {
    it('delega para o repositório', async () => {
      const repo = createMockCandidateRepository();
      const service = new CandidateService(repo);
      repo.findByEmail.mockResolvedValue(sampleCandidate);
      const result = await service.findByEmail('joao@teste.com');
      expect(result).toEqual(sampleCandidate);
    });
  });
});
