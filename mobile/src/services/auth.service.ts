import api from "../lib/api";
import { type ApiResponse, type AuthResponseData, type LoginPayload, type User } from "../types/auth.types";

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<ApiResponse<AuthResponseData>>("/auth/login", payload);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get<ApiResponse<{ user: User }>>("/auth/me");
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
