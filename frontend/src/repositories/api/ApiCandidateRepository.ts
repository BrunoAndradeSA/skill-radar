import type { Candidate } from '../../models/Candidate';
import type { CandidateRepository } from '../interfaces/CandidateRepository';
import { axiosInstance } from '../../api/axiosInstance';

export class ApiCandidateRepository implements CandidateRepository {
  async findAll(): Promise<Candidate[]> {
    const response = await axiosInstance.get('/candidates');
    return response.data;
  }

  async findById(id: string): Promise<Candidate | null> {
    const response = await axiosInstance.get(`/candidates/${id}`);
    return response.data;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    const response = await axiosInstance.get(`/candidates/email/${email}`);
    return response.data;
  }

  async create(data: Omit<Candidate, 'id'>): Promise<Candidate> {
    const response = await axiosInstance.post('/candidates', data);
    return response.data;
  }

  async update(id: string, data: Partial<Omit<Candidate, 'id'>>): Promise<Candidate> {
    const response = await axiosInstance.put(`/candidates/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/candidates/${id}`);
  }
}
