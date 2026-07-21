import { ExamTemplate } from '../../models/ExamTemplate';
import { TemplateRepository } from '../interfaces/TemplateRepository';
import { seedMockData } from '../../mocks/seed';
import { NotFoundError } from '../../models/errors';

export class MockTemplateRepository implements TemplateRepository {
  private getTemplates(): ExamTemplate[] {
    seedMockData();
    const data = localStorage.getItem('mock_templates');
    return data ? JSON.parse(data) : [];
  }

  private saveTemplates(items: ExamTemplate[]): void {
    localStorage.setItem('mock_templates', JSON.stringify(items));
  }

  async findAll(): Promise<ExamTemplate[]> {
    return this.getTemplates();
  }

  async findById(id: string): Promise<ExamTemplate | null> {
    const items = this.getTemplates();
    return items.find((t) => t.id === id) || null;
  }

  async create(template: Omit<ExamTemplate, 'id'>): Promise<ExamTemplate> {
    const items = this.getTemplates();
    const newItem: ExamTemplate = { ...template, id: crypto.randomUUID() };
    items.push(newItem);
    this.saveTemplates(items);
    return newItem;
  }

  async update(id: string, template: Omit<ExamTemplate, 'id'>): Promise<ExamTemplate> {
    const items = this.getTemplates();
    const index = items.findIndex((t) => t.id === id);
    if (index === -1) throw new NotFoundError('Template', id);
    
    items[index] = { ...template, id };
    this.saveTemplates(items);
    return items[index];
  }

  async delete(id: string): Promise<void> {
    const items = this.getTemplates();
    const filtered = items.filter((t) => t.id !== id);
    this.saveTemplates(filtered);
  }
}
