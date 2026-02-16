import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          set({
            user: response.data.user,
            accessToken: response.data.tokens.accessToken,
            refreshToken: response.data.tokens.refreshToken,
            isLoading: false
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false
          });
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false
          });
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await authService.logout(refreshToken);
          } catch (error) {
            console.error('Logout error:', error);
          }
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;

        try {
          const response = await authService.refreshToken(refreshToken);
          set({ accessToken: response.data.accessToken });
        } catch (error) {
          get().logout();
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      })
    }
  )
);