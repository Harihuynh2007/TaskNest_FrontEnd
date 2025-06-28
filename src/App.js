// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './components/auth/AuthForm';        // hiện tại bạn đang dùng :contentReference[oaicite:0]{index=0}
import ForgotPassword from './components/auth/ForgotPassword'; // :contentReference[oaicite:1]{index=1}

import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/common/ProtectedLayout';
import BoardsPage from './pages/BoardsPage';
      

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthForm mode="login" />} />
          <Route path="/register" element={<AuthForm mode="register" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
          <Route path="/*" element={<ProtectedLayout />}>
            <Route index element={<BoardsPage />} />
            
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
