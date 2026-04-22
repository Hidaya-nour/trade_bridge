import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { API_BASE_URL } from "@/lib/api";
import { authService } from "./auth.service";
import {
  type ChangePasswordPayload,
  type Tokens,
  type UpdateProfilePayload,
  type User,
} from "./auth.types";

const getReadableAuthError = (error: any) => {
  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Check your connection and backend status.";
  }

  if (!error?.response) {
    return `Network error. Cannot reach API at ${API_BASE_URL}. Ensure backend is running and URL is reachable from this device/browser.`;
  }

  return error?.response?.data?.message ?? error?.message ?? "Login failed";
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ user: User; tokens: Tokens }>;
  initialize: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  clearError: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isInitialized: false,
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
          const message = getReadableAuthError(error);

          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      initialize: async () => {
        const { accessToken } = useAuthStore.getState();

        if (!accessToken) {
          set({ isInitialized: true });
          return;
        }

        try {
          await useAuthStore.getState().fetchUser();
          set({ isInitialized: true, error: null });
        } catch {
          await useAuthStore.getState().logout();
          set({ isInitialized: true });
        }
      },

      fetchUser: async () => {
        const response = await authService.getCurrentUser();
        const user = response.data.user;
        set({ user, error: null });
      },

      updateProfile: async (payload) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.updateProfile(payload);
          set({
            user: response.data.user,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const message =
            error?.response?.data?.message ?? error?.message ?? "Failed to update profile";
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      changePassword: async (payload) => {
        set({ isLoading: true, error: null });

        try {
          await authService.changePassword(payload);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          const message =
            error?.response?.data?.message ?? error?.message ?? "Failed to change password";
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      clearError: () => set({ error: null }),

      logout: async () => {
        const { refreshToken } = useAuthStore.getState();

        if (refreshToken) {
          try {
            await authService.logout(refreshToken);
          } catch {
            // Ignore network/API errors and clear local auth state anyway.
          }
        }

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
