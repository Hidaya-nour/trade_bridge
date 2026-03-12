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
  profile_image?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
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

  async changePassword(data: ChangePasswordData) {
    const response = await api.patch('/auth/change-password', data);
    return response.data;
  }
};
