import axios from "axios";
import { API_BASE_URL } from "./constants";
import { useAuthStore } from "@/features/auth/auth.store";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const accessToken = refreshResponse.data?.data?.accessToken;

        useAuthStore.setState({ accessToken });
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
