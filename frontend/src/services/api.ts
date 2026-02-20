import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

/* =======================================================
   ✅ REQUEST INTERCEPTOR — Attach Access Token
======================================================= */
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =======================================================
   ✅ RESPONSE INTERCEPTOR — Handle 401 + Refresh
======================================================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          { refreshToken }
        );

        const { accessToken } = response.data.data;

        // ✅ Update Zustand store (not localStorage directly)
        useAuthStore.setState({ accessToken });

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        // If refresh fails → logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;