
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, WorkspaceProvider, ModalProvider } from './contexts';

import AuthForm from './features/auth/AuthForm';
import ForgotPassword from './features/auth/ForgotPassword';
import BoardsPage from './features/boards/BoardsPage';
import PrivateRoute from './Layout/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ModalProvider>
          <Router>
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

              <Route path="*" element={<Navigate to="/boards" replace />} />
            </Routes>
          </Router>
        </ModalProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
