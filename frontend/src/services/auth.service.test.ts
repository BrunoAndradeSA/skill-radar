import { describe, it, expect } from 'vitest';
import { AuthService } from './auth.service';
import { createMockAuthRepository } from '../test/mocks';
import { AuthError } from '../models/errors';

describe('AuthService', () => {
  describe('login', () => {
    it('retorna tokens com credenciais válidas', async () => {
      const repo = createMockAuthRepository();
      const service = new AuthService(repo);
      const tokens = { accessToken: 'abc', refreshToken: 'def' };
      repo.login.mockResolvedValue(tokens);

      const result = await service.login('admin', 'admin');
      expect(result).toEqual(tokens);
      expect(repo.login).toHaveBeenCalledWith('admin', 'admin');
    });

    it('rejeita username vazio', async () => {
      const repo = createMockAuthRepository();
      const service = new AuthService(repo);
      await expect(service.login('', 'admin')).rejects.toThrow(AuthError);
      expect(repo.login).not.toHaveBeenCalled();
    });

    it('rejeita senha vazia', async () => {
      const repo = createMockAuthRepository();
      const service = new AuthService(repo);
      await expect(service.login('admin', '')).rejects.toThrow(AuthError);
      expect(repo.login).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('delega para o repositório', async () => {
      const repo = createMockAuthRepository();
      const service = new AuthService(repo);
      repo.logout.mockResolvedValue(undefined);
      await service.logout();
      expect(repo.logout).toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('delega para o repositório', async () => {
      const repo = createMockAuthRepository();
      const service = new AuthService(repo);
      const user = { id: '1', name: 'Admin', email: 'admin@test.com', roles: ['ADMIN'], enabled: true };
      repo.getMe.mockResolvedValue(user);

      const result = await service.getMe();
      expect(result).toEqual(user);
    });
  });
});
