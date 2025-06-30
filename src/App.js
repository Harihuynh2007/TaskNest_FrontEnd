// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, WorkspaceProvider } from './contexts/';

import AuthForm from './features/auth/AuthForm';
import ForgotPassword from './features/auth/ForgotPassword';
import BoardsPage from './features/boards/BoardsPage'
import PrivateRoute from './Layout/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <Router>
          <Routes>
            <Route path="/login"          element={<AuthForm mode="login" />} />
            <Route path="/register"       element={<AuthForm mode="register" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/boards/*"
              element={
                <PrivateRoute>
                  <BoardsPage />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/boards" replace />} />
          </Routes>
        </Router>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
