// src/api/authApi.js
import api from './apiClient';
import { auth } from './apiRoutes';
import { TokenManager } from './tokenManager';

/**
 * Validation utilities
 */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

/**
 * Error handling utility
 * @param {Error} err - Error object
 * @param {Object} customMessages - Custom error messages by status code
 * @param {string} defaultMessage - Default error message
 * @returns {Error} Formatted error
 */
const handleApiError = (err, customMessages = {}, defaultMessage = 'Đã xảy ra lỗi không xác định') => {
  if (err.response) {
    const { status, data } = err.response;
    
    if (customMessages[status]) {
      return new Error(customMessages[status]);
    }
    
    const serverMessage = data?.detail || data?.message || data?.error;
    if (serverMessage) return new Error(serverMessage);
    
    if (typeof data === 'object' && data !== null) {
      const errorMessages = Object.values(data).flat().join(' '); 
      if (errorMessages) {
        return new Error(errorMessages);
      }
    }

    return new Error('Đã xảy ra lỗi từ phía server');
  } else if (err.request) {
    return new Error('Không thể kết nối tới server. Vui lòng kiểm tra lại mạng.');
  } else {
    return new Error(defaultMessage);
  }
};

// ==================== READ Operations ====================

/**
 * Get current user information
 * @returns {Promise<Object>} User data
 */
export const fetchMe = async () => {
  try {
    const res = await api.get(auth.me());
    return res.data;
  } catch (err) {
    throw handleApiError(err, {}, 'Không thể tải thông tin người dùng');
  }
};

/**
 * Get user profile information
 * @returns {Promise<Object>} User profile data
 */
export const fetchProfile = async () => {
  try {
    const res = await api.get(auth.profile());
    return res.data;
  } catch (err) {
    throw handleApiError(err, {}, 'Không thể tải thông tin người dùng');
  }
};

/**
 * Search users by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of users
 */
export const searchUsers = async (query) => {
  if (!query?.trim()) return [];
  try {
    const res = await api.get(auth.searchUsers(), { 
      params: { q: query } 
    });
    return res.data;
  } catch (err) {
    throw handleApiError(err, {}, 'Không thể tìm kiếm người dùng');
  }
};

// ==================== CREATE Operations ====================

/**
 * User login
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Login response with tokens
 */
export const login = async ({ email, password }) => {
  if (!isValidEmail(email)) throw new Error('Email không hợp lệ');
  if (!password) throw new Error('Mật khẩu không được để trống');

  try {
    const res = await api.post(auth.login(), { email, password });
    const { token, refresh } = res.data;
    
    if (token && refresh) {
      TokenManager.setTokens(token, refresh);
    }
    
    return res.data;
  } catch (err) {
    throw handleApiError(err, {
      400: 'Thông tin không hợp lệ',
      401: 'Email hoặc mật khẩu sai',
    });
  }
};

/**
 * User registration
 * @param {Object} userData - Registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} Registration response with tokens
 */
export const register = async ({ email, password }) => {
  if (!isValidEmail(email)) throw new Error('Email không hợp lệ');
  if (!isStrongPassword(password)) {
    throw new Error('Mật khẩu yếu. Mật khẩu phải dài ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
  }

  try {
    const res = await api.post(auth.register(), { email, password });
    const { token, refresh } = res.data;
    
    if (token && refresh) {
      TokenManager.setTokens(token, refresh);
    }
    
    return res.data;
  } catch (err) {
    throw handleApiError(err, {
      400: 'Thông tin đăng ký không hợp lệ',
      409: 'Email này đã được sử dụng',
    });
  }
};

// ==================== UPDATE Operations ====================

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile data
 */
export const updateProfile = async (profileData) => {
  try {
    const res = await api.patch(auth.profile(), profileData);
    return res.data;
  } catch (err) {
    throw handleApiError(err, {}, 'Không thể cập nhật thông tin người dùng');
  }
};

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.oldPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Password change response
 */
export const changePassword = async ({ oldPassword, newPassword }) => {
  // TODO: Backend chưa implement endpoint này
  // Uncomment khi BE đã ready
  /*
  if (!isStrongPassword(newPassword)) throw new Error('Mật khẩu mới quá yếu');
  if (oldPassword === newPassword) throw new Error('Mật khẩu mới không được trùng với mật khẩu cũ');
  
  try {
    const res = await api.post(auth.changePassword(), {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  } catch (err) {
    throw handleApiError(err, {
      400: 'Mật khẩu cũ không chính xác',
    }, 'Không thể thay đổi mật khẩu');
  }
  */
  throw new Error('Chức năng đổi mật khẩu chưa được kích hoạt');
};

// ==================== DELETE Operations ====================

/**
 * User logout
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await api.post(auth.logout());
  } catch (error) {
    console.error('API logout failed:', error);
  } finally {
    TokenManager.clearTokens();
    delete api.defaults?.headers?.common?.Authorization;
    window.dispatchEvent(new CustomEvent('unauthorized'));
  }
};