// src/api/authApi.js
import api from './axiosClient';

import * as workspaceApi from './workspaceApi'; // ✅ Thêm để gọi tạo workspace
import { toast } from 'react-toastify'; // ✅ nếu bạn đang dùng react-toastify

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
 * Đăng nhập & tạo workspace đầu tiên nếu cần
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
  const res = await authApi.post('/login/', {
    email,
    username: email,  
    password,
  });

  const access = res.data.token || res.data.access;
  const refresh = res.data.refresh;

  localStorage.setItem('token', access);
  localStorage.setItem('refresh_token', refresh);


  // ✅ Sau khi login → Kiểm tra và tạo workspace đầu tiên nếu cần
  try {
    const wsRes = await workspaceApi.fetchWorkspaces();
    if (!wsRes.data || wsRes.data.length === 0) {
      const created = await workspaceApi.createWorkspace({ name: 'My First Workspace' });
      console.log('🎉 Auto-created workspace:', created.data);
      toast.success('Created your first workspace!');
    }
  } catch (err) {
    console.error('❌ Error while auto-creating workspace:', err);
  }

  return res;
}

/**
 * Đăng ký tài khoản
 */
export async function register(email, password) {
  const res = await authApi.post('/register/', {
    email,
    username: email,  
    password,
  });

  const access = res.data.token || res.data.access;
  const refresh = res.data.refresh;

  localStorage.setItem('token', access);
  localStorage.setItem('refresh_token', refresh);

  // ⏳ Chờ 10ms để chắc chắn token đã lưu
  await new Promise((r) => setTimeout(r, 10));

  try {
    const wsRes = await workspaceApi.fetchWorkspaces();
    if (!wsRes.data || wsRes.data.length === 0) {
      const created = await workspaceApi.createWorkspace({ name: 'My First Workspace' });
      console.log('🎉 Auto-created workspace:', created.data);
    }
  } catch (err) {
    console.error('❌ Error while auto-creating workspace:', err);
  }

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
