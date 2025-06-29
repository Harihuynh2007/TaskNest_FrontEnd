// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // optionally: fetch /auth/me here
    }
    setLoading(false);
  }, []);

  const login = (email, password) =>
    authApi.login(email, password).then(res => {
      const token = res.data.access || res.data.token;
      localStorage.setItem('token', token);
      setUser(res.data.user || { email });
      return res;
    });

  const signup = (email, password) =>
    authApi.register(email, password).then(res => {
      const token = res.data.access || res.data.token;
      localStorage.setItem('token', token);
      setUser(res.data.user || { email });
      return res;
    });

  const logout = () =>
    authApi.logout().then(() => {
      localStorage.removeItem('token');
      setUser(null);
    });

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
