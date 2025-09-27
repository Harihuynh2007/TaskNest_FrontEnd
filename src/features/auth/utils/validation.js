export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

// Hàm validate cho form, trả về thông báo lỗi
export const validateField = (name, value, password = '') => {
  switch (name) {
    case 'email':
      if (!value) return 'Email không được để trống';
      if (!isValidEmail(value)) return 'Định dạng email không hợp lệ';
      return '';
    
    case 'password':
      if (!value) return 'Mật khẩu không được để trống';
      // Thay vì isStrongPassword, có thể chỉ check độ dài ở client cho UX tốt hơn
      // và để server check đầy đủ. Ở đây ta dùng check đơn giản.
      if (value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
      // Nếu muốn đồng bộ 100%, bạn có thể hiển thị chi tiết yêu cầu của isStrongPassword
      return '';

    case 'confirm':
      if (!value) return 'Vui lòng xác nhận mật khẩu';
      if (value !== password) return 'Mật khẩu không khớp';
      return '';

    default:
      return '';
  }
};