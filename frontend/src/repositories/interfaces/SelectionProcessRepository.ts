import type { CandidateInput, RankingItem, SelectionProcess } from '../../models/SelectionProcess';
import type { CreateEntity } from '../../models/types';

export interface SelectionProcessRepository {
  findAll(): Promise<SelectionProcess[]>;
  findById(id: string): Promise<SelectionProcess | null>;
  create(data: CreateSelectionProcess): Promise<SelectionProcess>;
  addCandidates(id: string, candidates: CandidateInput[]): Promise<SelectionProcess>;
  getRankings(id: string): Promise<RankingItem[]>;
  delete(id: string): Promise<void>;
}

export type CreateSelectionProcess = Omit<CreateEntity<SelectionProcess>, 'totalInvitations' | 'totalFinished' | 'createdAt' | 'updatedAt'> & {
  candidates: CandidateInput[];
};
