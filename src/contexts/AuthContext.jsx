// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { register, login as authLogin, logout as authLogout } from '../api/authApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/me/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await res.json();
      setUser({
        email: data.email || data.username,
        name: data.name || data.username,
        role: data.role || 'user', // Thêm role từ API
      });
    } catch (err) {
      console.error('Lỗi khi fetch user:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, [fetchUserDetails]); // Thêm fetchUserDetails vào dependency để fix lỗi

  const signup = useCallback(async (email, password) => {
    const res = await authLogin(email, password);
    const token = res.data.token || res.data.access;
    localStorage.setItem('token', token);
    await fetchUserDetails(); // LẤY CHI TIẾT
    return res;
  }, [fetchUserDetails]);


  const login = useCallback(async (email, password) => {
    const res = await authLogin(email, password);
    const token = res.data.token || res.data.access;
    localStorage.setItem('token', token);
    await fetchUserDetails(); // LẤY CHI TIẾT
    return res;
  }, [fetchUserDetails]);


  const logout = useCallback(() => {
    return authLogout()
      .then(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .catch(error => {
        console.error('Logout API error:', error);
        localStorage.removeItem('token');
        setUser(null);
      });
  }, []);

  // Thêm hàm checkPermission để hỗ trợ phân quyền (dùng trong Member & Role Management)
  const checkPermission = useCallback((permission) => {
    if (!user || !user.role) return false;
    const permissions = {
      owner: ['edit', 'delete', 'invite', 'manage'],
      member: ['edit'],
      viewer: []
    };
    return permissions[user.role]?.includes(permission) || false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkPermission,fetchUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
}