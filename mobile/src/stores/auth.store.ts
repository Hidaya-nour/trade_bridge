import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authService } from "../services/auth.service";
import { type Tokens, type User } from "../types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ user: User; tokens: Tokens }>;
  clearError: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login({ email, password });
          const { user, tokens } = response.data as { user: User; tokens: Tokens };

          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isLoading: false,
            error: null,
          });

          return { user, tokens };
        } catch (error: any) {
          const message =
            error?.response?.data?.message ?? error?.message ?? "Login failed";

          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      clearError: () => set({ error: null }),

      logout: async () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
        });
      },
    }),
    {
      name: "mobile-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
