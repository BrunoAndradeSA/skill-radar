import { BaseRepository } from './BaseRepository';
import { Candidate } from '../../models/Candidate';

export interface CandidateRepository extends BaseRepository<Candidate> {
  findByEmail(email: string): Promise<Candidate | null>;
}
