import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const refreshToken = localStorage.getItem('refresh_token');

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        localStorage.setItem('token', newAccess);
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccess;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error('🔐 Refresh token failed:', refreshErr);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
