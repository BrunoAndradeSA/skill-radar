import { Theme } from '../../models/Theme';
import { ThemeRepository } from '../interfaces/ThemeRepository';
import { seedMockData } from '../../mocks/seed';
import { NotFoundError } from '../../models/errors';

export class MockThemeRepository implements ThemeRepository {
  private getThemes(): Theme[] {
    seedMockData();
    const data = localStorage.getItem('mock_themes');
    return data ? JSON.parse(data) : [];
  }

  private saveThemes(themes: Theme[]): void {
    localStorage.setItem('mock_themes', JSON.stringify(themes));
  }

  async findAll(): Promise<Theme[]> {
    return this.getThemes();
  }

  async findById(id: string): Promise<Theme | null> {
    const themes = this.getThemes();
    return themes.find((t) => t.id === id) || null;
  }

  async create(theme: Omit<Theme, 'id'>): Promise<Theme> {
    const themes = this.getThemes();
    const newTheme: Theme = { ...theme, id: crypto.randomUUID() };
    themes.push(newTheme);
    this.saveThemes(themes);
    return newTheme;
  }

  async update(id: string, theme: Omit<Theme, 'id'>): Promise<Theme> {
    const themes = this.getThemes();
    const index = themes.findIndex((t) => t.id === id);
    if (index === -1) throw new NotFoundError('Tema', id);
    
    themes[index] = { ...theme, id };
    this.saveThemes(themes);
    return themes[index];
  }

  async delete(id: string): Promise<void> {
    const themes = this.getThemes();
    const filtered = themes.filter((t) => t.id !== id);
    this.saveThemes(filtered);
  }
}
