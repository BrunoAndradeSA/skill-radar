import type { ExamTemplate } from '../../models/ExamTemplate';
import { TemplateRepository } from '../interfaces';
import { axiosInstance } from '../../api/axiosInstance';

export class ApiTemplateRepository implements TemplateRepository {
  async findAll(): Promise<ExamTemplate[]> {
    const response = await axiosInstance.get('/templates');
    return response.data;
  }

  async findById(id: string): Promise<ExamTemplate | null> {
    const response = await axiosInstance.get(`/templates/${id}`);
    return response.data;
  }

  async create(template: Omit<ExamTemplate, 'id'>): Promise<ExamTemplate> {
    const response = await axiosInstance.post('/templates', template);
    return response.data;
  }

  async update(id: string, template: Omit<ExamTemplate, 'id'>): Promise<ExamTemplate> {
    const response = await axiosInstance.put(`/templates/${id}`, template);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/templates/${id}`);
  }
}
