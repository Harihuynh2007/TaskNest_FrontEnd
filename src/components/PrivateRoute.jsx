// src/components/PrivateRoute.jsx

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Đang kiểm tra xác thực…</div>;
  }

  return user ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}
