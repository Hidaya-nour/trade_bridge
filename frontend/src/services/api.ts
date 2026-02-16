import axios from 'axios';
import { Navigate } from 'react-router-dom';
// import { authService } from '../services/authService';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor - add token to every request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ⛔ Skip refresh logic for login & refresh endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          { refreshToken }
        );

        const { accessToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from storage
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Call refresh endpoint
        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          { refreshToken }
        );

        // Save new access token
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;