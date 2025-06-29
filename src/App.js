// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';

import AuthForm from './components/auth/AuthForm';
import ForgotPassword from './components/auth/ForgotPassword';
import BoardsPage from './pages/BoardsPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthForm mode="login" />} />
            <Route path="/register" element={<AuthForm mode="register" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route
              path="/boards"
              element={
                <PrivateRoute>
                  <BoardsPage />
                </PrivateRoute>
              }
            />

            {/* Fallback: if logged in → /boards, else → /login */}
            <Route
              path="*"
              element={<Navigate to="/boards" replace />}
            />
          </Routes>
        </Router>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
