import { Candidate } from '../models/Candidate';
import type { CreateEntity, UpdateEntity } from '../models/types';
import { CandidateRepository } from '../repositories/interfaces/CandidateRepository';
import { ValidationError } from '../models/errors';

export class CandidateService {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async getAllCandidates(): Promise<Candidate[]> {
    return this.candidateRepository.findAll();
  }

  async getCandidateById(id: string): Promise<Candidate | null> {
    return this.candidateRepository.findById(id);
  }

  async createCandidate(data: CreateEntity<Candidate>): Promise<Candidate> {
    if (!data.name?.trim()) throw new ValidationError('O nome é obrigatório');
    if (!data.email?.trim()) throw new ValidationError('O email é obrigatório');
    if (!data.cargo?.trim()) throw new ValidationError('O cargo é obrigatório');
    if (!data.setor?.trim()) throw new ValidationError('O setor é obrigatório');
    if (!data.nivel?.trim()) throw new ValidationError('O nível é obrigatório');
    if (!data.squad?.trim()) throw new ValidationError('A squad é obrigatória');
    return this.candidateRepository.create(data);
  }

  async updateCandidate(id: string, data: UpdateEntity<Candidate>): Promise<Candidate> {
    if (data.name !== undefined && !data.name.trim()) throw new ValidationError('O nome não pode estar vazio');
    return this.candidateRepository.update(id, data);
  }

  async deleteCandidate(id: string): Promise<void> {
    await this.candidateRepository.delete(id);
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    return this.candidateRepository.findByEmail(email);
  }
}
