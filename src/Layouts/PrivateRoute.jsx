// src/Layouts/PrivateRoute.jsx
import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import FullPageLoader from './FullPageLoader';

const PrivateRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading, checkAuth } = useContext(AuthContext);
  const location = useLocation();

  // Re-validate auth on mount
  useEffect(() => {
    if (!loading && !user && typeof checkAuth === 'function') {
      checkAuth();
    }
  }, [loading, user, checkAuth]);

  // 1. Loading state - show loader
  if (loading) {
    return <FullPageLoader />;
  }

  // 2. No user - redirect to login
  if (!user) {
    console.log('[PrivateRoute] No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role-based access control (if required)
  if (requiredRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      console.warn('[PrivateRoute] User lacks required roles:', requiredRoles);
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            from: location,
            message: 'You do not have permission to access this page' 
          }} 
          replace 
        />
      );
    }
  }

  // 4. Authenticated and authorized - render children
  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
};

export default PrivateRoute;