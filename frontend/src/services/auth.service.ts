import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: 'retailer' | 'distributor' | 'factory' | 'driver';
  phone?: string;
  business_name?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  business_name?: string;
  tin_number?: string;
  is_vat_registered?: boolean;
  vat_rate?: number;
  profile_image?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

const unwrapApiData = <T>(payload: any): T => {
  if (payload?.data !== undefined) {
    return payload.data as T;
  }

  return payload as T;
};

const normalizeUserListResponse = (
  payload: any,
): { users: any[]; total: number } => {
  const data = unwrapApiData<any>(payload);

  if (Array.isArray(data)) {
    return { users: data, total: data.length };
  }

  if (Array.isArray(data?.users)) {
    return {
      users: data.users,
      total:
        typeof data.total === "number" ? data.total : data.users.length,
    };
  }

  return { users: [], total: 0 };
};

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async appealSuspension(payload: { email: string; message: string }) {
    const response = await api.post('/auth/appeal-suspension', payload);
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logout(refreshToken: string) {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: UpdateProfileData) {
    const response = await api.patch('/auth/me', data);
    return response.data;
  },

  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/auth/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async changePassword(data: ChangePasswordData) {
    const response = await api.patch('/auth/change-password', data);
    return response.data;
  },

  async approveUser(userId: string) {
    const response = await api.post(`/auth/admin/approve/${userId}`);
    return response.data;
  },

  async suspendUser(userId: string) {
    const response = await api.post(`/auth/admin/suspend/${userId}`);
    return response.data;
  },

  async reactivateUser(userId: string) {
    const response = await api.post(`/auth/admin/reactivate/${userId}`);
    return response.data;
  },

  async getUsers(options?: {
    limit?: number;
    offset?: number;
    role?: string;
    status?: string;
    search?: string;
    orderBy?: string;
    orderDirection?: string;
  }) {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.role) params.append('role', options.role);
    if (options?.status) params.append('status', options.status);
    if (options?.search) params.append('search', options.search);
    if (options?.orderBy) params.append('orderBy', options.orderBy);
    if (options?.orderDirection) params.append('orderDirection', options.orderDirection);

    const queryString = params.toString();
    const url = queryString ? `/auth/admin/users?${queryString}` : '/auth/admin/users';
    const response = await api.get(url);
    return normalizeUserListResponse(response.data);
  },

  async getRecentUsers(limit?: number) {
    const url = limit ? `/auth/admin/recent-users?limit=${limit}` : '/auth/admin/recent-users';
    const response = await api.get(url);
    return normalizeUserListResponse(response.data);
  }
};
