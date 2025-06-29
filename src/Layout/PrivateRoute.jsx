// src/layouts/PrivateRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts';

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <p>Checking auth…</p>;
  return user ? children : <Navigate to="/login" replace />;
}
