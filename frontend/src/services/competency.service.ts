import { Competency } from '../models/Competency';
import { CompetencyRepository } from '../repositories/interfaces/CompetencyRepository';
import { ValidationError } from '../models/errors';

export class CompetencyService {
  constructor(private readonly competencyRepository: CompetencyRepository) {}

  async getAllCompetencies(themeId?: string): Promise<Competency[]> {
    return this.competencyRepository.findAll(themeId);
  }

  async getCompetencyById(id: string): Promise<Competency | null> {
    return this.competencyRepository.findById(id);
  }

  async createCompetency(competency: Omit<Competency, 'id'>): Promise<Competency> {
    if (!competency.name?.trim()) throw new ValidationError('O nome da competência é obrigatório');
    if (!competency.themeId) throw new ValidationError('O ID do tema é obrigatório');
    return this.competencyRepository.create(competency);
  }

  async updateCompetency(id: string, competency: Omit<Competency, 'id'>): Promise<Competency> {
    return this.competencyRepository.update(id, competency);
  }

  async deleteCompetency(id: string): Promise<void> {
    return this.competencyRepository.delete(id);
  }
}
