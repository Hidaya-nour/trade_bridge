import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  phone?: string;
  business_name?: string;
  business_address?: string;
  tin_number?: string;
  profile_image?: string;
  verified: boolean;
  created_at: string;
  last_login?: string;
  
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  // ✅ Return login data
  login: (email: string, password: string) => Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  fetchUser: () => Promise<void>;
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

          // 🔑 Destructure correctly
          const { user, tokens } = response.data;

          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isLoading: false
          });

          return { user, tokens };

        } catch (error: any) {
          const message =
            error.response?.data?.message || error.message || 'Login failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);

          set({ isLoading: false });
          return response.data; // return for success handling

        } catch (error: any) {
          const message =
            error.response?.data?.message || error.message || 'Registration failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        const { refreshToken, user } = get();
        if (refreshToken && user) {
          try {
            await authService.logout(refreshToken);
          } catch (error) {
            console.error('Logout error:', error);
          }
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },
      fetchUser: async () => {
        try {
          const response = await authService.getCurrentUser();
          const { user } = response.data;

          set({ user });
        } catch (error) {
          get().logout();
        }
      }
      ,
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;

        try {
          const response = await authService.refreshToken(refreshToken);

          // 🔑 Unwrap data
          const { accessToken } = response.data;
          set({ accessToken });

        } catch (error) {
          console.error('Refresh token failed:', error);
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
