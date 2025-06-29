// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import {
  login as doLogin,
  logout as doLogout,
  register as doRegister
} from '../services/AuthService';  

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Nếu backend có endpoint /auth/me, bạn có thể fetch profile ở đây:
      // API.get('/auth/me').then(res => setUser(res.data.user));
    }
    setLoading(false);
  }, []);

  const login = (email, password) =>
    doLogin(email, password).then(res => {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res;
    });

  const signup = (email, password) =>
    doRegister(email, password).then(res => {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res;
    });

  const logout = () =>
    doLogout().then(() => {
      localStorage.removeItem('token');
      setUser(null);
    });

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
