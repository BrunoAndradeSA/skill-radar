import type { Question } from '../../models/Question';
import { QuestionRepository } from '../interfaces';
import { axiosInstance } from '../../api/axiosInstance';

export class ApiQuestionRepository implements QuestionRepository {
  async findAll(filters?: { themeId?: string; seniority?: string; type?: string }): Promise<Question[]> {
    const params = { ...filters, theme_id: filters?.themeId };
    delete (params as Record<string, unknown>).themeId;
    const response = await axiosInstance.get('/questions', { params });
    return response.data;
  }

  async findById(id: string): Promise<Question | null> {
    const response = await axiosInstance.get(`/questions/${id}`);
    return response.data;
  }

  async create(question: Omit<Question, 'id'>): Promise<Question> {
    const response = await axiosInstance.post('/questions', question);
    return response.data;
  }

  async update(id: string, question: Omit<Question, 'id'>): Promise<Question> {
    const response = await axiosInstance.put(`/questions/${id}`, question);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/questions/${id}`);
  }
}
