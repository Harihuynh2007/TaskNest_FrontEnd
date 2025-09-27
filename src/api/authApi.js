// --- START OF REFACTORED FILE authApi.js ---

import api from './apiClient';

// =======================
// API Endpoints Constants
// =======================
const API_ENDPOINTS = {
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  LOGOUT: '/auth/logout/',
  PROFILE: '/auth/profile/',
  CHANGE_PASSWORD: '/auth/change-password/',
  SEARCH_USERS: '/auth/users/search/',
};

// =======================
// Input Validation
// =======================
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

// =======================
// Error Handling Helper
// =======================
/**
 * Handles API errors, preferring server-sent messages.
 * @param {Error} err - The error object from the catch block.
 * @param {Object.<number, string>} customMessages - A map of status codes to custom error messages.
 * @param {string} defaultMessage - A default message if no other message is found.
 * @returns {Error} A new Error object with a user-friendly message.
 */
const handleApiError = (err, customMessages = {}, defaultMessage = 'Đã xảy ra lỗi không xác định') => {
  if (err.response) {
    const { status, data } = err.response;
    
    // Ưu tiên thông báo lỗi cụ thể từ map
    if (customMessages[status]) {
      return new Error(customMessages[status]);
    }
    
    // Nếu không, thử lấy thông báo lỗi từ response của server
    const serverMessage = data?.detail || data?.message || data?.error;
    if (serverMessage) return new Error(serverMessage);
    
    // Xử lý lỗi validation kiểu object/array
    if (typeof data === 'object' && data !== null) {
      const errorMessages = Object.values(data)
        .flat() // Làm phẳng mảng 2 chiều [[err1], [err2]] -> [err1, err2]
        .join(' '); 
      if (errorMessages) {
        return new Error(errorMessages);
      }
    }

    // Fallback cho các lỗi server chung
    return new Error('Đã xảy ra lỗi từ phía server');
  } else if (err.request) {
    // Lỗi không kết nối được tới server
    return new Error('Không thể kết nối tới server. Vui lòng kiểm tra lại mạng.');
  } else {
    return new Error(defaultMessage);
  }
};


// =======================
// Auth APIs
// =======================
export const login = async ({ email, password }) => {
  if (!isValidEmail(email)) throw new Error('Email không hợp lệ');
  if (!password) throw new Error('Mật khẩu không được để trống');

  try {
    const res = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    return res.data;
  } catch (err) {
    throw handleApiError(err, {
      400: 'Thông tin không hợp lệ',
      401: 'Email hoặc mật khẩu sai',
    });
  }
};

export const register = async ({ email, password }) => {
  if (!isValidEmail(email)) throw new Error('Email không hợp lệ');
  if (!isStrongPassword(password)) throw new Error('Mật khẩu yếu. Mật khẩu phải dài ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');

  try {
    const res = await api.post(API_ENDPOINTS.REGISTER, { email, password });
    return res.data;
  } catch (err) {
    throw handleApiError(err, {
      400: 'Thông tin đăng ký không hợp lệ',
      409: 'Email này đã được sử dụng',
    });
  }
};

export const logout = async () => {
  try {
    // Gọi API logout
    api.post(API_ENDPOINTS.LOGOUT);
  } catch (error) {
    // Ghi log lỗi nếu cần
    console.error('API logout failed:', error);
  } finally {
    // dọn dẹp phía client
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    // Thông báo cho các phần khác của ứng dụng rằng người dùng đã đăng xuất
    window.dispatchEvent(new CustomEvent('unauthorized'));
  }
};

// =======================
// User / Profile APIs
// =======================
export const getProfile = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.PROFILE);
    return res.data;
  } catch (err) {
    throw handleApiError(err, {}, 'Không thể tải thông tin người dùng');
  }
};

export const updateProfile = async (profileData) => {
  try {
    const res = await api.put(API_ENDPOINTS.PROFILE, profileData);
    return res.data;
  } catch (err) {
    throw handleApiError(err, {}, 'Không thể cập nhật thông tin người dùng');
  }
};

export const changePassword = async ({ oldPassword, newPassword }) => {
  if (!isStrongPassword(newPassword)) throw new Error('Mật khẩu mới quá yếu');
  if (oldPassword === newPassword) throw new Error('Mật khẩu mới không được trùng với mật khẩu cũ');
  
  try {
    const res = await api.post(API_ENDPOINTS.CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  } catch (err) {
    throw handleApiError(err, {
      400: 'Mật khẩu cũ không chính xác',
    }, 'Không thể thay đổi mật khẩu');
  }
};

// =======================
// Utility APIs
// =======================
export const searchUsers = async (query) => {
  if (!query?.trim()) return [];
  try {
    const res = await api.get(`${API_ENDPOINTS.SEARCH_USERS}?q=${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    throw handleApiError(err, {}, 'Không thể tìm kiếm người dùng');
  }
};