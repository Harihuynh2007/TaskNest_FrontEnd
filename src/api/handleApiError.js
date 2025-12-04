// src/api/handleApiError.js

/**
 * Centralized API error handler
 * Formats errors consistently across all API modules
 */

/**
 * Enhanced error handler with detailed logging
 * @param {Error} error - Error object from axios
 * @param {Object} customMessages - Custom error messages by status code
 * @param {string} defaultMessage - Default error message
 * @param {Object} context - Additional context for logging (optional)
 * @returns {Error} Formatted error with user-friendly message
 */
export const handleApiError = (
  error,
  customMessages = {},
  defaultMessage = 'Đã xảy ra lỗi không xác định',
  context = {}
) => {
  // Log error for debugging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', {
      message: error.message,
      context,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
    });
  }

  // Network error (no response from server)
  if (error.request && !error.response) {
    return new Error('Không thể kết nối tới server. Vui lòng kiểm tra lại mạng.');
  }

  // HTTP error (server responded with error)
  if (error.response) {
    const { status, data } = error.response;

    // Priority 1: Custom message for this specific status
    if (customMessages[status]) {
      return new Error(customMessages[status]);
    }

    // Priority 2: Server returned error message
    const serverMessage = data?.detail || data?.message || data?.error;
    if (serverMessage) {
      return new Error(serverMessage);
    }

    // Priority 3: Validation errors (Django/DRF style)
    if (typeof data === 'object' && data !== null) {
      const errorMessages = Object.entries(data)
        .map(([field, messages]) => {
          const msgArray = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${msgArray.join(', ')}`;
        })
        .filter(Boolean)
        .join('; ');

      if (errorMessages) {
        return new Error(errorMessages);
      }
    }

    // Priority 4: Standard HTTP status messages
    const standardMessages = {
      400: 'Dữ liệu gửi lên không hợp lệ',
      401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      403: 'Bạn không có quyền thực hiện thao tác này',
      404: 'Không tìm thấy dữ liệu',
      409: 'Dữ liệu bị xung đột',
      422: 'Dữ liệu không thể xử lý',
      429: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
      500: 'Lỗi server. Vui lòng thử lại sau.',
      502: 'Lỗi kết nối server',
      503: 'Server đang bảo trì. Vui lòng thử lại sau.',
      504: 'Server không phản hồi',
    };

    if (standardMessages[status]) {
      return new Error(standardMessages[status]);
    }

    // Fallback
    return new Error(defaultMessage);
  }

  // Other errors (e.g., request setup errors)
  return new Error(error.message || defaultMessage);
};

/**
 * Validate ID helper
 * @param {string|number} id - ID to validate
 * @param {string} fieldName - Field name for error message
 * @throws {Error} If ID is invalid
 */
export const isValidId = (id, fieldName = 'ID') => {
  if (id == null || id === '') {
    throw new Error(`${fieldName} không được để trống`);
  }

  const numId = Number(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error(`${fieldName} không hợp lệ`);
  }

  return true;
};

/**
 * Standard error messages (for consistency)
 */
export const ERROR_MESSAGES = {
  // Network
  NETWORK_ERROR: 'Không thể kết nối tới server. Vui lòng kiểm tra lại mạng.',
  TIMEOUT: 'Yêu cầu quá thời gian chờ',

  // Auth
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',

  // Validation
  INVALID_DATA: 'Dữ liệu không hợp lệ',
  MISSING_REQUIRED: 'Thiếu thông tin bắt buộc',

  // Server
  SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau.',
  NOT_FOUND: 'Không tìm thấy dữ liệu',

  // Default
  DEFAULT: 'Đã xảy ra lỗi không xác định',
};

export default handleApiError;