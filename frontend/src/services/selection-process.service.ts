import type { CandidateInput, RankingItem, SelectionProcess } from '../models/SelectionProcess';
import type { CreateSelectionProcess, SelectionProcessRepository } from '../repositories/interfaces/SelectionProcessRepository';
import { ValidationError } from '../models/errors';

export class SelectionProcessService {
  constructor(private readonly repository: SelectionProcessRepository) {}

  async getAll(): Promise<SelectionProcess[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<SelectionProcess | null> {
    return this.repository.findById(id);
  }

  async create(data: CreateSelectionProcess): Promise<SelectionProcess> {
    if (!data.name?.trim()) throw new ValidationError('O nome do processo é obrigatório');
    if (!data.templateId) throw new ValidationError('O template é obrigatório');
    if (!data.startDate) throw new ValidationError('A data de início é obrigatória');
    if (!data.endDate) throw new ValidationError('A data de término é obrigatória');
    return this.repository.create(data);
  }

  async addCandidates(id: string, candidates: CandidateInput[]): Promise<SelectionProcess> {
    if (candidates.length === 0) throw new ValidationError('Adicione ao menos um candidato');
    return this.repository.addCandidates(id, candidates);
  }

  async getRankings(id: string): Promise<RankingItem[]> {
    return this.repository.getRankings(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
