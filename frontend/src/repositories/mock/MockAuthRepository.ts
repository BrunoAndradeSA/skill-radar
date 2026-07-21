import type { User } from '../../models/User';
import type { AuthRepository } from '../interfaces/AuthRepository';
import { AuthError } from '../../models/errors';

export class MockAuthRepository implements AuthRepository {
  async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!username.trim() || !password.trim()) {
      throw new AuthError('Credenciais inválidas');
    }
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };
  }

  async logout(): Promise<void> {
  }

  async getMe(): Promise<User> {
    return {
      id: '1',
      name: 'Admin User',
      email: 'admin@admin.com',
      roles: ['ADMIN'],
      enabled: true,
    };
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    void token;
    return {
      accessToken: 'mock-refreshed-access-token',
      refreshToken: 'mock-refreshed-refresh-token',
    };
  }
}
