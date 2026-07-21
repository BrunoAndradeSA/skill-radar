import { Candidate } from '../../models/Candidate';
import { CandidateRepository } from '../interfaces/CandidateRepository';
import { seedMockData } from '../../mocks/seed';
import { NotFoundError } from '../../models/errors';

export class MockCandidateRepository implements CandidateRepository {
  private getCandidates(): Candidate[] {
    seedMockData();
    const data = localStorage.getItem('mock_candidates');
    return data ? JSON.parse(data) : [];
  }

  private saveCandidates(items: Candidate[]): void {
    localStorage.setItem('mock_candidates', JSON.stringify(items));
  }

  async findAll(): Promise<Candidate[]> {
    return this.getCandidates();
  }

  async findById(id: string): Promise<Candidate | null> {
    const items = this.getCandidates();
    return items.find((c) => c.id === id) || null;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    const items = this.getCandidates();
    return items.find((c) => c.email === email) || null;
  }

  async create(data: Omit<Candidate, 'id'>): Promise<Candidate> {
    const items = this.getCandidates();
    const newItem: Candidate = { ...data, id: crypto.randomUUID() };
    items.push(newItem);
    this.saveCandidates(items);
    return newItem;
  }

  async update(id: string, data: Partial<Candidate>): Promise<Candidate> {
    const items = this.getCandidates();
    const index = items.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundError('Candidato', id);
    items[index] = { ...items[index], ...data };
    this.saveCandidates(items);
    return items[index];
  }

  async delete(id: string): Promise<void> {
    const items = this.getCandidates();
    const filtered = items.filter((c) => c.id !== id);
    this.saveCandidates(filtered);
  }
}
