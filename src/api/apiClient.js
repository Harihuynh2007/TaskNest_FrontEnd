// src/api/apiClient.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: false,
  timeout: 15000, // 15s, an toàn hơn cho request lâu
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================
// Token refresh manager
// =====================
let isRefreshing = false;
let failedQueue = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Clear stored tokens and notify app
 */
const clearAuthAndNotify = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  window.dispatchEvent(new CustomEvent('unauthorized'));
};

const getStoredToken = () => localStorage.getItem('token');
const getStoredRefreshToken = () => localStorage.getItem('refresh_token');

const storeToken = (token) => {
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// =====================
// Request Interceptor
// =====================
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging (only once per request, only in dev)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =====================
// Response Interceptor
// =====================
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Logging lỗi (chỉ dev)
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `❌ [API Error] ${error.response?.status || 'Network'} ${error.config?.url}`
      );
    }

    // Chỉ xử lý lỗi 401 có refresh token
    if (error.response?.status !== 401 || !getStoredRefreshToken()) {
      return Promise.reject(error);
    }

    // Nếu đã retry rồi mà vẫn lỗi → clear auth
    if (originalRequest._retry) {
      clearAuthAndNotify();
      return Promise.reject(error);
    }

    // Nếu đang refresh → xếp hàng đợi
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

    // Bắt đầu refresh token
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getStoredRefreshToken();
      const res = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccessToken = res.data.access;
      if (!newAccessToken) {
        throw new Error('No access token received');
      }

      storeToken(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

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
