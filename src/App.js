// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './components/auth/AuthForm';
import ForgotPassword from './components/auth/ForgotPassword';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Route mặc định chuyển sang /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Login */}
        <Route
          path="/login"
          element={<AuthForm mode="login" baseUrl="http://localhost:8000/api" />}
        />
      <Route
        path="/register"
        element={<AuthForm mode="register" baseUrl="http://localhost:8000/api" />}
      />
      <Route
        path="/forgot-password"
        element={<ForgotPassword baseUrl="http://localhost:8000/api" />}
      />
      </Routes>
    </Router>
  );
}
