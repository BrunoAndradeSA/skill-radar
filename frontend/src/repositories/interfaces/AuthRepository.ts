import type { User } from '../../models/User';

export interface AuthRepository {
  login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
  refresh(token: string): Promise<{ accessToken: string; refreshToken: string }>;
}
