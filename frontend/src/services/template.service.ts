import { ExamTemplate } from '../models/ExamTemplate';
import { TemplateRepository } from '../repositories/interfaces/TemplateRepository';
import { ValidationError } from '../models/errors';

export class TemplateService {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async getAllTemplates(): Promise<ExamTemplate[]> {
    return this.templateRepository.findAll();
  }

  async getTemplateById(id: string): Promise<ExamTemplate | null> {
    return this.templateRepository.findById(id);
  }

  async createTemplate(template: Omit<ExamTemplate, 'id'>): Promise<ExamTemplate> {
    if (!template.name?.trim()) throw new ValidationError('O nome do template é obrigatório');
    if (!template.themes?.length) throw new ValidationError('O template precisa ter pelo menos um tema');
    return this.templateRepository.create(template);
  }

  async updateTemplate(id: string, template: Omit<ExamTemplate, 'id'>): Promise<ExamTemplate> {
    return this.templateRepository.update(id, template);
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.templateRepository.delete(id);
  }
}
