import React, { createContext, useState, useEffect } from 'react';
import { register, login as authLogin, logout as authLogout } from '../api/authApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserDetails(); // GỌI HÀM này để lấy user chi tiết
    } else {
      setLoading(false);
    }
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
  const logout = () => {
    return authLogout()
      .then(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .catch(error => {
        console.error('Logout API error:', error);
        localStorage.removeItem('token'); // Xóa token thủ công
        setUser(null); // Đặt user về null dù API thất bại
      });
  };

  const fetchUserDetails = async () => {
  try {
    const res = await fetch('http://localhost:8000/api/auth/me/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await res.json();
    setUser({
      email: data.email || data.username, 
      name: data.name || data.username,
      role: data.role || 'user',
    });
  } catch (err) {
    console.error('Lỗi khi fetch user:', err);
    setUser(null);
  } finally {
    setLoading(false);
  }
};


  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
