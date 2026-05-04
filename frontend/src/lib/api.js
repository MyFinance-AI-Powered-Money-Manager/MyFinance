import axios from 'axios';
import { showError } from './toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://myfinance-backend-staging.up.railway.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    const hasResponse = Boolean(error.response);
    const shouldSkipGlobalError = error.config?.meta?.skipGlobalErrorHandler;

    // Avoid duplicate toasts when local handlers already show API errors.
    if (!hasResponse && !shouldSkipGlobalError) {
      const message = error.message || 'Network error. Please check your connection.';
      showError(message);
    }

    return Promise.reject(error);
  }
);

export default api;
