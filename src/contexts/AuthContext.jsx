
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login as authLogin, logout as authLogout, register as authRegister } from '../api/authApi';
import { fetchWorkspaces } from '../api/workspaceApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);

  const fetchUserDetails = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/me/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch user details');
      const data = await res.json();
      setUser({
        email: data.email || data.username,
        name: data.name || data.username,
        role: data.role || 'user',
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const preloadWorkspaces = useCallback(async () => {
    try {
      const res = await fetchWorkspaces(); // this should return array of workspaces
      setWorkspaces(res.data || []);
    } catch (err) {
      console.error('Failed to preload workspaces:', err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserDetails().then(preloadWorkspaces);
    } else {
      setLoading(false);
    }
  }, [fetchUserDetails, preloadWorkspaces]);

  const login = useCallback(async (email, password) => {
    const res = await authLogin(email, password);
    const token = res.data.token || res.data.access;
    localStorage.setItem('token', token);
    await fetchUserDetails();      // 1. Fetch user
    await preloadWorkspaces();     // 2. Preload workspaces
    return res;
  }, [fetchUserDetails, preloadWorkspaces]);

  const signup = useCallback(async (email, password) => {
  const res = await authRegister(email, password);
  const token = res.data.token || res.data.access;
  localStorage.setItem('token', token);
  await fetchUserDetails();
  await preloadWorkspaces();
  return res;
}, [fetchUserDetails, preloadWorkspaces]);

  const logout = useCallback(() => {
    return authLogout()
      .then(() => {
        localStorage.removeItem('token');
        setUser(null);
        setWorkspaces([]);
      })
      .catch(error => {
        console.error('Logout error:', error);
        localStorage.removeItem('token');
        setUser(null);
      });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,signup, workspaces
    }}>
      {children}
    </AuthContext.Provider>
  );
}