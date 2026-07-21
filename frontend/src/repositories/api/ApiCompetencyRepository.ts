import type { Competency } from '../../models/Competency';
import { CompetencyRepository } from '../interfaces';
import { axiosInstance } from '../../api/axiosInstance';

export class ApiCompetencyRepository implements CompetencyRepository {
  async findAll(themeId?: string): Promise<Competency[]> {
    const params = themeId ? { theme_id: themeId } : {};
    const response = await axiosInstance.get('/competencies', { params });
    return response.data;
  }

  async findById(id: string): Promise<Competency | null> {
    const response = await axiosInstance.get(`/competencies/${id}`);
    return response.data;
  }

  async create(competency: Omit<Competency, 'id'>): Promise<Competency> {
    const response = await axiosInstance.post('/competencies', competency);
    return response.data;
  }

  async update(id: string, competency: Omit<Competency, 'id'>): Promise<Competency> {
    const response = await axiosInstance.put(`/competencies/${id}`, competency);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/competencies/${id}`);
  }
}
