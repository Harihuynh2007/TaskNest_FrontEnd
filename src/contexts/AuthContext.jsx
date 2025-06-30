import React, { createContext, useState, useEffect } from 'react';
import { register, login as authLogin, logout as authLogout } from '../api/authApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nếu đã có token, có thể fetch thêm /api/auth/me để get user details
    const token = localStorage.getItem('token');
    if (token) {
      setUser({}); // tạm đẩy vào dạng logged-in
    }
    setLoading(false);
  }, []);

  // Hàm signup nhận (email, password)
  const signup = (email, password) =>
    register(email, password).then(res => {
      // Lưu token và user
      const token = res.data.token || res.data.access;
      localStorage.setItem('token', token);
      setUser({ email });
      return res;
    });

  // Hàm login nhận (email, password)
  const login = (email, password) =>
    authLogin(email, password).then(res => {
      const token = res.data.token || res.data.access;
      localStorage.setItem('token', token);
      setUser({ email });
      return res;
    });

  // Hàm logout
  const logout = () =>
    authLogout().then(() => {
      localStorage.removeItem('token');
      setUser(null);
    });

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
