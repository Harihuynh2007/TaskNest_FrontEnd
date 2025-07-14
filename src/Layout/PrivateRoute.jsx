
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

const PrivateRoute = ({ children }) => {
  const { user, loading, error } = useContext(AuthContext); 

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /> Loading...</div>;
  if (error) return <div>Error: {error.message}. Please login again.</div>; // Xử lý lỗi
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default PrivateRoute;