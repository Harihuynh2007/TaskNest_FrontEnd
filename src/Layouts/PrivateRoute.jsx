import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Spinner } from 'react-bootstrap';
import FullPageLoader from './FullPageLoader';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  const token = localStorage.getItem('token');

  // Chờ loading hoàn tất nếu có token
  if (token && loading) {
    return <FullPageLoader />;
  }

  // Nếu không có token và không có user → về login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
