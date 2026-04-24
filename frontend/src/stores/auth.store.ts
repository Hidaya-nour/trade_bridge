import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  authService,
  type ChangePasswordData,
  type UpdateProfileData,
} from "../services/auth.service";

/* =========================
   User Role Type
========================= */

export type UserRole =
  | "retailer"
  | "distributor"
  | "factory"
  | "driver"
  | "admin";

/* =========================
   User Interface
========================= */

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole; 
  status: string;
  phone?: string;
  business_name?: string;
  tin_number?: string;
  is_vat_registered?: boolean;
  vat_rate?: number;
  profile_image?: string;
  verified: boolean;
  created_at: string;
  last_login?: string;
}

/* =========================
   Tokens Interface
========================= */

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export type AccountBlock = {
  code: "ACCOUNT_SUSPENDED" | "ACCOUNT_INACTIVE";
  message: string;
};

/* =========================
   Auth State Interface
========================= */

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  accountBlocked: AccountBlock | null;
  isLoading: boolean;
  error: string | null;

  login: (
    email: string,
    password: string
  ) => Promise<{ user: User; tokens: Tokens }>;

  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  clearError: () => void;
  setAccountBlocked: (blocked: AccountBlock | null) => void;
}

/* =========================
   Store
========================= */

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      accountBlocked: null,
      isLoading: false,
      error: null,

      /* ================= LOGIN ================= */

      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login({ email, password });

          const { user, tokens } = response.data as {
            user: User;
            tokens: Tokens;
          };

          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isLoading: false,
            accountBlocked: null,
          });

          return { user, tokens };
        } catch (error: any) {
          const code = error.response?.data?.code as
            | "ACCOUNT_SUSPENDED"
            | "ACCOUNT_INACTIVE"
            | undefined;
          const message =
            error.response?.data?.message ||
            error.message ||
            "Login failed";

          set({
            error: message,
            isLoading: false,
            accountBlocked: code ? { code, message } : null,
          });
          throw new Error(message);
        }
      },

      /* ================= REGISTER ================= */

      register: async (data) => {
        set({ isLoading: true, error: null });

        try {
          await authService.register(data);
          set({ isLoading: false });
        } catch (error: any) {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Registration failed";

          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      /* ================= LOGOUT ================= */

      logout: async () => {
        const { refreshToken } = get();

        try {
          if (refreshToken) {
            await authService.logout(refreshToken);
          }
        } catch (error) {
          console.error("Logout API error:", error);
        }

        // Always clear state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          accountBlocked: null,
        });
      },

      /* ================= FETCH USER ================= */

      fetchUser: async () => {
        try {
          const response = await authService.getCurrentUser();

          const { user } = response.data as { user: User };

          set({ user });
        } catch (error) {
          console.error("Fetch user failed:", error);
          await get().logout();
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.updateProfile(data);
          const { user } = response.data as { user: User };
          set({ user, isLoading: false });
        } catch (error: any) {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Profile update failed";
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      changePassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authService.changePassword(data);
          set({ isLoading: false });
        } catch (error: any) {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Password change failed";
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      /* ================= REFRESH TOKEN ================= */

      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) return;

        try {
          const response = await authService.refreshToken(refreshToken);

          const { accessToken } = response.data as {
            accessToken: string;
          };

          set({ accessToken });
        } catch (error) {
          console.error("Refresh token failed:", error);
          await get().logout();
        }
      },

      /* ================= CLEAR ERROR ================= */

      clearError: () => set({ error: null }),
      setAccountBlocked: (blocked) => set({ accountBlocked: blocked }),
    }),
    {
      name: "auth-storage",

      // Only persist safe data
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accountBlocked: state.accountBlocked,
      }),
    }
  )
);
