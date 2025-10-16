import axios from 'axios';
import { TokenManager } from './tokenManager';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: false,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

const clearAuthAndNotify = () => {
  TokenManager.clearTokens();
  window.dispatchEvent(new CustomEvent('unauthorized'));
};

const storeToken = (accessToken, refreshToken) => {
  TokenManager.setTokens(accessToken, refreshToken);
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
};

api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ [API Error] ${status || 'Network'} ${error.config?.url}`);
    }

    if (status !== 401 || !TokenManager.getRefreshToken()) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearAuthAndNotify();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = TokenManager.getRefreshToken();
      const res = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, { refresh: refreshToken });
      const newAccess = res.data.access || res.data.token;

      if (!newAccess) throw new Error('No access token received');
      storeToken(newAccess, refreshToken);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      processQueue(null, newAccess);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthAndNotify();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
