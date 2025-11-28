// src/Layouts/PrivateRoute.jsx
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import FullPageLoader from './FullPageLoader';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 1. Nếu đang tải thông tin user (ví dụ: đang fetch profile từ token), hiện Loader
  if (loading) {
    return <FullPageLoader />;
  }

  // 2. Nếu đã tải xong mà không có user -> Chuyển về Login
  // Lưu ý: AuthContext nên tự handle việc check localStorage khi khởi động app
  if (!user) {
    // state={{ from: location }} giúp chuyển hướng lại trang cũ sau khi login thành công
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Đã xác thực -> Render nội dung
  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;