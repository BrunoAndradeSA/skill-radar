import { describe, it, expect } from 'vitest';
import { TemplateService } from './template.service';
import { createMockTemplateRepository } from '../test/mocks';
import { ValidationError } from '../models/errors';

describe('TemplateService', () => {
  describe('createTemplate', () => {
    it('cria template com dados válidos', async () => {
      const repo = createMockTemplateRepository();
      const service = new TemplateService(repo);
      const input = {
        name: 'Template Padrão',
        seniority: 'Pleno' as const,
        durationMinutes: 60,
        isCertification: false,
        themes: [{ themeId: '1', questionCount: 5 }],
      };
      repo.create.mockResolvedValue({ id: '1', ...input });

      const result = await service.createTemplate(input);
      expect(result.name).toBe('Template Padrão');
    });

    it('rejeita template sem nome', async () => {
      const repo = createMockTemplateRepository();
      const service = new TemplateService(repo);
      await expect(
        service.createTemplate({
          name: '',
          seniority: 'Pleno',
          durationMinutes: 60,
          isCertification: false,
          themes: [{ themeId: '1', questionCount: 5 }],
        }),
      ).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita template sem temas', async () => {
      const repo = createMockTemplateRepository();
      const service = new TemplateService(repo);
      await expect(
        service.createTemplate({
          name: 'Template',
          seniority: 'Pleno',
          durationMinutes: 60,
          isCertification: false,
          themes: [],
        }),
      ).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });
});
