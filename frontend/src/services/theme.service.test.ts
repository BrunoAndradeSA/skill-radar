import { describe, it, expect } from 'vitest';
import { ThemeService } from './theme.service';
import { createMockThemeRepository } from '../test/mocks';
import { ValidationError } from '../models/errors';

describe('ThemeService', () => {
  describe('createTheme', () => {
    it('cria tema com nome válido', async () => {
      const repo = createMockThemeRepository();
      const service = new ThemeService(repo);
      repo.create.mockResolvedValue({ id: '1', name: 'Frontend' });

      const result = await service.createTheme({ name: 'Frontend' });
      expect(result.name).toBe('Frontend');
      expect(repo.create).toHaveBeenCalledWith({ name: 'Frontend' });
    });

    it('rejeita tema sem nome', async () => {
      const repo = createMockThemeRepository();
      const service = new ThemeService(repo);
      await expect(service.createTheme({ name: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita tema com nome somente espaços', async () => {
      const repo = createMockThemeRepository();
      const service = new ThemeService(repo);
      await expect(service.createTheme({ name: '   ' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('updateTheme', () => {
    it('atualiza tema com nome válido', async () => {
      const repo = createMockThemeRepository();
      const service = new ThemeService(repo);
      repo.update.mockResolvedValue({ id: '1', name: 'Backend' });

      const result = await service.updateTheme('1', { name: 'Backend' });
      expect(result.name).toBe('Backend');
    });

    it('rejeita atualização com nome vazio', async () => {
      const repo = createMockThemeRepository();
      const service = new ThemeService(repo);
      await expect(service.updateTheme('1', { name: '' })).rejects.toThrow(ValidationError);
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteTheme', () => {
    it('delega para o repositório', async () => {
      const repo = createMockThemeRepository();
      const service = new ThemeService(repo);
      repo.delete.mockResolvedValue(undefined);
      await service.deleteTheme('1');
      expect(repo.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('getAllThemes', () => {
    it('delega para o repositório', async () => {
      const repo = createMockThemeRepository();
      const service = new ThemeService(repo);
      repo.findAll.mockResolvedValue([{ id: '1', name: 'Frontend' }]);
      const result = await service.getAllThemes();
      expect(result).toHaveLength(1);
    });
  });
});
