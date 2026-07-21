import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../models/User';

interface UserState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  reconcile: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setUser: (user) => set((state) => ({ user, isAuthenticated: !!state.token && !!user })),
      setToken: (token) => set((state) => ({ token, isAuthenticated: !!token && !!state.user })),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setTokens: (accessToken, refreshToken) => set((state) => ({
        token: accessToken,
        refreshToken,
        isAuthenticated: !!accessToken && !!state.user,
      })),
      logout: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
      reconcile: () => {
        const { token, user } = get();
        set({ isAuthenticated: !!token && !!user });
      },
    }),
    {
      name: 'user_session',
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.reconcile();
      },
    },
  ),
);
