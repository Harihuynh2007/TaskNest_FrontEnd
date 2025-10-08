// src/api/authApi.js
import api from './apiClient';
import { TokenManager } from './tokenManager';

/** ======================
 *  API Endpoints (BE)
 *  ====================== */
const API = {
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  LOGOUT: '/auth/logout/',
  ME: '/auth/me/',                 // user + profile (read-only)
  PROFILE: '/auth/me/profile/',    // GET | PATCH profile
  SEARCH_USERS: '/auth/users/search/',
};

/** ======================
 *  Validators
 *  ====================== */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** ======================
 *  Error mapper
 *  ====================== */
const handleApiError = (err, custom = {}, fallback = 'Đã xảy ra lỗi không xác định') => {
  if (err?.response) {
    const { status, data } = err.response;
    if (custom[status]) return new Error(custom[status]);

    const msg = data?.detail || data?.message || data?.error;
    if (msg) return new Error(msg);

    if (data && typeof data === 'object') {
      const joined = Object.values(data).flat().join(' ');
      if (joined) return new Error(joined);
    }
    return new Error('Đã xảy ra lỗi từ phía server');
  }
  if (err?.request) return new Error('Không thể kết nối tới server. Vui lòng kiểm tra mạng.');
  return new Error(fallback);
};

/** ======================
 *  Auth APIs
 *  ====================== */
export const login = async ({ email, password }) => {
  if (!isValidEmail(email)) throw new Error('Email không hợp lệ');
  if (!password) throw new Error('Mật khẩu không được để trống');

  try {
    const res = await api.post(API.LOGIN, { email, password });
    // BE trả: { ok, user, token, refresh }
    const { token, refresh, user } = res.data || {};
    if (token) TokenManager.setTokens(token, refresh);
    return { access: token, refresh, user };
  } catch (err) {
    throw handleApiError(err, {
      400: 'Thông tin không hợp lệ',
      401: 'Email hoặc mật khẩu sai',
    });
  }
};

export const register = async ({ email, password }) => {
  if (!isValidEmail(email)) throw new Error('Email không hợp lệ');
  if (!password) throw new Error('Mật khẩu không được để trống');

  try {
    const res = await api.post(API.REGISTER, { email, password });
    // Tuỳ BE, thường cũng trả { token, refresh, user }
    const { token, refresh } = res.data || {};
    if (token) TokenManager.setTokens(token, refresh); // auto-login nếu có
    return res.data;
  } catch (err) {
    throw handleApiError(err, {
      400: 'Thông tin đăng ký không hợp lệ',
      409: 'Email đã được sử dụng',
    });
  }
};

export const logout = async () => {
  try {
    await api.post(API.LOGOUT);
  } catch (error) {
    // không chặn luồng logout client-side
    console.error('API logout failed:', error);
  } finally {
    TokenManager.clearTokens();
    delete api.defaults?.headers?.common?.Authorization;
    window.dispatchEvent(new CustomEvent('unauthorized'));
  }
};

/** ======================
 *  User / Profile
 *  ====================== */
export const getMe = async () => {
  try {
    const res = await api.get(API.ME);
    return res.data; // user + profile (read-only)
  } catch (err) {
    throw handleApiError(err, {}, 'Không thể tải thông tin người dùng');
  }
};

export const getProfile = async () => {
  try {
    const res = await api.get(API.PROFILE);
    return res.data; // chỉ profile
  } catch (err) {
    throw handleApiError(err, {}, 'Không thể tải hồ sơ người dùng');
  }
};

export const updateProfile = async (profileData) => {
  try {
    const res = await api.patch(API.PROFILE, profileData);
    return res.data;
  } catch (err) {
    throw handleApiError(err, {}, 'Không thể cập nhật hồ sơ người dùng');
  }
};

// BE chưa có endpoint change-password → để TODO
// export const changePassword = async ({ oldPassword, newPassword }) => { ... };

/** ======================
 *  Utilities
 *  ====================== */
export const searchUsers = async (query) => {
  if (!query?.trim()) return [];
  try {
    const res = await api.get(`${API.SEARCH_USERS}?q=${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    throw handleApiError(err, {}, 'Không thể tìm kiếm người dùng');
  }
};
