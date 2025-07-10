
import axios from 'axios';

// Instance axios trỏ tới Django
const authApi = axios.create({
  baseURL: 'http://localhost:8000/api/auth',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

// Đảm bảo gửi JSON
authApi.defaults.headers.post['Content-Type'] = 'application/json';

/**
 * Đăng ký tài khoản
 * @param {string} email
 * @param {string} password
 * @returns Promise
 */
export function register(email, password) {
  return authApi.post('/register/', {
    username: email,
    password,
  });
}

/**
 * Đăng nhập
 * @param {string} email
 * @param {string} password
 * @returns Promise
 */
export function login(email, password) {
  return authApi.post('/login/', {
    username: email,
    password,
  });
}

/**
 * Đăng xuất
 * @returns Promise
 */
export function logout() {
  return authApi.post('/logout/');
}

/**
 * Chuyển tài khoản
 * @param {string} email
 * @returns Promise
 */
export function switchAccount({ email }) {
  return authApi.post('/switch-account/', {
    username: email,
  });
}
