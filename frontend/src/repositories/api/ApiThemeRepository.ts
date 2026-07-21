import type { Theme } from '../../models/Theme';
import { ThemeRepository } from '../interfaces';
import { axiosInstance } from '../../api/axiosInstance';

export class ApiThemeRepository implements ThemeRepository {
  async findAll(): Promise<Theme[]> {
    const response = await axiosInstance.get('/themes');
    return response.data;
  }

  async findById(id: string): Promise<Theme | null> {
    const response = await axiosInstance.get(`/themes/${id}`);
    return response.data;
  }

  async create(theme: Omit<Theme, 'id'>): Promise<Theme> {
    const response = await axiosInstance.post('/themes', theme);
    return response.data;
  }

  async update(id: string, theme: Omit<Theme, 'id'>): Promise<Theme> {
    const response = await axiosInstance.put(`/themes/${id}`, theme);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/themes/${id}`);
  }
}
