import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

const getBlockFromError = (err: any) => {
  const status = err?.response?.status;
  const code = err?.response?.data?.code;
  const message =
    err?.response?.data?.message ||
    err?.message ||
    "Your account is not allowed to perform this action.";

  if (status === 403 && code === "ACCOUNT_SUSPENDED") {
    return { code: "ACCOUNT_SUSPENDED" as const, message };
  }

  // Fallback for older backend responses (no `code` field)
  if (
    status === 403 &&
    typeof message === "string" &&
    message.toLowerCase().includes("suspend")
  ) {
    return { code: "ACCOUNT_SUSPENDED" as const, message };
  }

  return null;
};

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
    const blocked = getBlockFromError(error);
    if (blocked) {
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        accountBlocked: blocked,
      } as any);

      if (window.location.pathname !== "/account-suspended") {
        window.location.assign("/account-suspended");
      }

      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post("http://localhost:5000/api/auth/refresh", {
          refreshToken,
        });

        const { accessToken } = response.data.data;

        useAuthStore.setState({ accessToken });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        const refreshBlocked = getBlockFromError(refreshError);
        if (refreshBlocked) {
          useAuthStore.setState({
            user: null,
            accessToken: null,
            refreshToken: null,
            accountBlocked: refreshBlocked,
          } as any);

          if (window.location.pathname !== "/account-suspended") {
            window.location.assign("/account-suspended");
          }

          return Promise.reject(refreshError);
        }

        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

