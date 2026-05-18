import api from "@/lib/api";
import {
  type ApiResponse,
  type AuthResponseData,
  type ChangePasswordPayload,
  type LoginPayload,
  type UpdateProfilePayload,
  type User,
} from "./auth.types";

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<ApiResponse<AuthResponseData>>("/auth/login", payload);
    return response.data;
  },

  async register(payload: any) {
    const response = await api.post<ApiResponse<AuthResponseData>>("/auth/register", payload);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return response.data;
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const response = await api.patch<ApiResponse<{ user: User }>>("/auth/me", payload);
    return response.data;
  },

  async changePassword(payload: ChangePasswordPayload) {
    const response = await api.patch<ApiResponse<null>>("/auth/change-password", payload);
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  async logout(refreshToken: string) {
    const response = await api.post<ApiResponse<null>>("/auth/logout", { refreshToken });
    return response.data;
  },
};
