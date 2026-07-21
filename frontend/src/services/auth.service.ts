import type { User } from '../models/User';
import type { AuthRepository } from '../repositories/interfaces/AuthRepository';
import { AuthError } from '../models/errors';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!username?.trim()) throw new AuthError('O usuário é obrigatório');
    if (!password?.trim()) throw new AuthError('A senha é obrigatória');

    return this.authRepository.login(username, password);
  }

  async logout(): Promise<void> {
    await this.authRepository.logout();
  }

  async getMe(): Promise<User> {
    return this.authRepository.getMe();
  }
}
