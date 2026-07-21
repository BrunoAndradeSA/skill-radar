import { describe, it, expect } from 'vitest';
import { CompetencyService } from './competency.service';
import { createMockCompetencyRepository } from '../test/mocks';
import { ValidationError } from '../models/errors';

describe('CompetencyService', () => {
  describe('createCompetency', () => {
    it('cria competência com dados válidos', async () => {
      const repo = createMockCompetencyRepository();
      const service = new CompetencyService(repo);
      repo.create.mockResolvedValue({ id: '1', themeId: '1', name: 'React' });

      const result = await service.createCompetency({ themeId: '1', name: 'React' });
      expect(result.name).toBe('React');
    });

    it('rejeita sem nome', async () => {
      const repo = createMockCompetencyRepository();
      const service = new CompetencyService(repo);
      await expect(service.createCompetency({ themeId: '1', name: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita sem themeId', async () => {
      const repo = createMockCompetencyRepository();
      const service = new CompetencyService(repo);
      await expect(service.createCompetency({ themeId: '', name: 'React' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });
});
