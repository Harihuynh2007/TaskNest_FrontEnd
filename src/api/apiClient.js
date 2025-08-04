// src/api/apiClient.js
import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle refresh token on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    const refreshToken = localStorage.getItem('refresh_token');

    if (err.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });
        const newAccess = res.data.access;
        localStorage.setItem('token', newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new CustomEvent('unauthorized'));
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
