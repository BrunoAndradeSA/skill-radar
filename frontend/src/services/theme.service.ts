import { Theme } from '../models/Theme';
import { ThemeRepository } from '../repositories/interfaces/ThemeRepository';
import { ValidationError } from '../models/errors';

export class ThemeService {
  constructor(private readonly themeRepository: ThemeRepository) {}

  async getAllThemes(): Promise<Theme[]> {
    return this.themeRepository.findAll();
  }

  async getThemeById(id: string): Promise<Theme | null> {
    return this.themeRepository.findById(id);
  }

  async createTheme(theme: Omit<Theme, 'id'>): Promise<Theme> {
    if (!theme.name?.trim()) throw new ValidationError('O nome do tema é obrigatório');
    return this.themeRepository.create(theme);
  }

  async updateTheme(id: string, theme: Omit<Theme, 'id'>): Promise<Theme> {
    if (!theme.name?.trim()) throw new ValidationError('O nome do tema é obrigatório');
    return this.themeRepository.update(id, theme);
  }

  async deleteTheme(id: string): Promise<void> {
    return this.themeRepository.delete(id);
  }
}
