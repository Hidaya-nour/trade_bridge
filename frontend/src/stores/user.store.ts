import { create } from "zustand";
import { authService } from "../services/auth.service";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: "retailer" | "distributor" | "factory" | "driver" | "admin";
  status: "active" | "pending" | "suspended" | "inactive";
  phone?: string;
  business_name?: string;
  tin_number?: string;
  is_vat_registered?: boolean;
  vat_rate?: number;
  profile_image?: string;
  verified: boolean;
  created_at: string;
  last_login?: string;
  approved_at?: string;
  approved_by?: string;
}

interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

interface UserState {
  users: AdminUser[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  pagination: {
    page: number;
    limit: number;
  };
}

interface UserActions {
  fetchUsers: (filters?: UserFilters, pagination?: { page: number; limit: number }) => Promise<void>;
  fetchRecentUsers: (limit?: number) => Promise<AdminUser[]>;
  approveUser: (userId: string) => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  setFilters: (filters: Partial<UserFilters>) => void;
  setPagination: (pagination: Partial<{ page: number; limit: number }>) => void;
  clearError: () => void;
}

const initialState: UserState = {
  users: [],
  total: 0,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 50,
  },
};

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  ...initialState,

  fetchUsers: async (filters = {}, pagination: Partial<{ page: number; limit: number }> = {}) => {
    set({ loading: true, error: null });

    try {
      const currentFilters = { ...get().filters, ...filters };
      const currentPagination = { ...get().pagination, ...pagination };

      const offset = (currentPagination.page - 1) * currentPagination.limit;

      const response = await authService.getUsers({
        ...currentFilters,
        limit: currentPagination.limit,
        offset,
      });

      let users = Array.isArray(response?.users) ? response.users : [];
      let total = typeof response?.total === "number" ? response.total : users.length;

      // Fallback to recent users when the paged endpoint comes back empty unexpectedly.
      if (
        users.length === 0 &&
        !currentFilters.role &&
        !currentFilters.status &&
        !currentFilters.search &&
        currentPagination.page === 1
      ) {
        const fallback = await authService.getRecentUsers(currentPagination.limit);
        users = Array.isArray(fallback?.users) ? fallback.users : [];
        total =
          typeof fallback?.total === "number" && fallback.total > 0
            ? fallback.total
            : users.length;
      }

      set({
        users,
        total,
        loading: false,
        filters: currentFilters,
        pagination: currentPagination,
      });
    } catch (error: any) {
      set({
        loading: false,
        error:
          error?.response?.data?.message ||
          error.message ||
          "Failed to fetch users",
      });
    }
  },

  fetchRecentUsers: async (limit = 10) => {
    try {
      const response = await authService.getRecentUsers(limit);
      const users = response?.users || [];
      return users;
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          error.message ||
          "Failed to fetch recent users",
      });
      return [];
    }
  },

  approveUser: async (userId: string) => {
    try {
      await authService.approveUser(userId);

      // Update the user in the local state
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId
            ? { ...user, status: "active", verified: true, approved_at: new Date().toISOString() }
            : user
        ),
      }));
    } catch (error: any) {
      set({ error: error.message || "Failed to approve user" });
      throw error;
    }
  },

  suspendUser: async (userId: string) => {
    // Note: This would need a backend endpoint for suspending users
    // For now, we'll just update the local state
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, status: "suspended" } : user
      ),
    }));
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setPagination: (pagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    }));
  },

  clearError: () => {
    set({ error: null });
  },
}));
