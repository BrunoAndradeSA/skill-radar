import type { User } from '../../models/User';
import type { AuthRepository } from '../interfaces/AuthRepository';
import { axiosInstance } from '../../api/axiosInstance';
import { AuthError } from '../../models/errors';

export class ApiAuthRepository implements AuthRepository {
  async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await axiosInstance.post('/auth/login', { username, password });
      return {
        accessToken: response.data.accessToken as string,
        refreshToken: response.data.refreshToken as string,
      };
    } catch {
      throw new AuthError('Credenciais inválidas');
    }
  }

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  }

  async getMe(): Promise<User> {
    const response = await axiosInstance.get('/auth/me');
    const body = response.data as { data?: User };
    return (body?.data ?? body) as User;
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await axiosInstance.post('/auth/refresh', { refresh_token: token });
      return {
        accessToken: response.data.accessToken as string,
        refreshToken: response.data.refreshToken as string,
      };
    } catch {
      throw new AuthError('Falha ao renovar sessão');
    }
  }
}
