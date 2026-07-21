import type { CandidateInput, RankingItem, SelectionProcess } from '../../models/SelectionProcess';
import type { CreateSelectionProcess, SelectionProcessRepository } from '../interfaces/SelectionProcessRepository';
import { axiosInstance } from '../../api/axiosInstance';

function extractData<T>(response: { data?: { data?: T } }): T {
  if (response.data && response.data.data !== undefined) return response.data.data;
  return response.data as unknown as T;
}

export class ApiSelectionProcessRepository implements SelectionProcessRepository {
  async findAll(): Promise<SelectionProcess[]> {
    const response = await axiosInstance.get('/selection-processes');
    return extractData<SelectionProcess[]>(response);
  }

  async findById(id: string): Promise<SelectionProcess | null> {
    try {
      const response = await axiosInstance.get(`/selection-processes/${id}`);
      return extractData<SelectionProcess>(response);
    } catch {
      return null;
    }
  }

  async create(data: CreateSelectionProcess): Promise<SelectionProcess> {
    const response = await axiosInstance.post('/selection-processes', data);
    return extractData<SelectionProcess>(response);
  }

  async addCandidates(id: string, candidates: CandidateInput[]): Promise<SelectionProcess> {
    const response = await axiosInstance.post(`/selection-processes/${id}/candidates`, { candidates });
    return extractData<SelectionProcess>(response);
  }

  async getRankings(id: string): Promise<RankingItem[]> {
    const response = await axiosInstance.get(`/selection-processes/${id}/rankings`);
    return extractData<RankingItem[]>(response);
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/selection-processes/${id}`);
  }
}
