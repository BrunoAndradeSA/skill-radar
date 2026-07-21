import { Competency } from '../../models/Competency';
import { CompetencyRepository } from '../interfaces/CompetencyRepository';
import { seedMockData } from '../../mocks/seed';
import { NotFoundError } from '../../models/errors';

export class MockCompetencyRepository implements CompetencyRepository {
  private getCompetencies(): Competency[] {
    seedMockData();
    const data = localStorage.getItem('mock_competencies');
    return data ? JSON.parse(data) : [];
  }

  private saveCompetencies(items: Competency[]): void {
    localStorage.setItem('mock_competencies', JSON.stringify(items));
  }

  async findAll(themeId?: string): Promise<Competency[]> {
    const items = this.getCompetencies();
    if (themeId) {
      return items.filter((c) => c.themeId === themeId);
    }
    return items;
  }

  async findById(id: string): Promise<Competency | null> {
    const items = this.getCompetencies();
    return items.find((c) => c.id === id) || null;
  }

  async create(competency: Omit<Competency, 'id'>): Promise<Competency> {
    const items = this.getCompetencies();
    const newItem: Competency = { ...competency, id: crypto.randomUUID() };
    items.push(newItem);
    this.saveCompetencies(items);
    return newItem;
  }

  async update(id: string, competency: Omit<Competency, 'id'>): Promise<Competency> {
    const items = this.getCompetencies();
    const index = items.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundError('Competência', id);
    
    items[index] = { ...competency, id };
    this.saveCompetencies(items);
    return items[index];
  }

  async delete(id: string): Promise<void> {
    const items = this.getCompetencies();
    const filtered = items.filter((c) => c.id !== id);
    this.saveCompetencies(filtered);
  }
}
