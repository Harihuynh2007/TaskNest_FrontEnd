// src/App.js
import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

import AuthForm from './features/auth/AuthForm';
import ForgotPassword from './features/auth/ForgotPassword';
import BoardsPage from './features/boards/BoardsPage';
import TemplatesPage from './features/templates/TemplatesPage';
import HomePage from './features/home/HomePage';

import PrivateRoute from './Layout/PrivateRoute';

const LogoutRedirect = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return null;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthForm mode="login" />} />
      <Route path="/register" element={<AuthForm mode="register" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/boards/*"
        element={
          <PrivateRoute>
            <BoardsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <PrivateRoute>
            <TemplatesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />

      <Route path="/" element={<LogoutRedirect />} />
      <Route path="*" element={<Navigate to="/boards" replace />} />
    </Routes>
  );
}

export default App;
