// src/api/authApi.js
import api from './axiosClient';

// Tạo instance riêng cho auth
const authApi = api.create({
  baseURL: 'http://localhost:8000/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: chỉ gắn token nếu KHÔNG phải login/register
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isPublicRoute = config.url.includes('/login') || config.url.includes('/register');

  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Đăng ký tài khoản
 * @param {string} email
 * @param {string} password
 */
export function register(email, password) {
  return authApi.post('/register/', {
    email,
    password,
  });
}

/**
 * Đăng nhập
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
  const res = await api.post('http://localhost:8000/api/auth/login/', {
    email,
    password,
  });

  const access = res.data.token || res.data.access;
  const refresh = res.data.refresh;

  localStorage.setItem('token', access);
  localStorage.setItem('refresh_token', refresh); // ✅ lưu thêm refresh

  return res;
}


/**
 * Đăng xuất
 */
export function logout() {
  return authApi.post('/logout/');
}

/**
 * Chuyển tài khoản
 */
export function switchAccount({ email }) {
  return authApi.post('/switch-account/', {
    username: email,
  });
}

export default authApi;
