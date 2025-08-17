
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login as authLogin, logout as authLogout, register as authRegister } from '../api/authApi';
import { fetchWorkspaces } from '../api/workspaceApi';
import api from '../api/apiClient'; 

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);

  const fetchUserDetails = useCallback(async () => {
    try {
      
      const { data } = await api.get('/auth/me/');
        setUser({
        id: data.id,
        email: data.email,
        username: data.username,
        role: data.role || 'user',
        profile: data.profile, 
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('token');
       localStorage.removeItem('refresh_token'); 
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
      Promise.all([fetchUserDetails(), preloadWorkspaces()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [fetchUserDetails, preloadWorkspaces]);

  // Lắng nghe sự kiện cập nhật profile từ các trang khác
  useEffect(() => {
    const handleUserUpdate = () => {
      console.log("AuthContext: Received 'auth:user-updated' event. Refetching user details...");
      fetchUserDetails(); // Gọi lại hàm fetch user để lấy dữ liệu mới nhất
    };

    window.addEventListener('auth:user-updated', handleUserUpdate);

    // Dọn dẹp listener khi component unmount
    return () => {
      window.removeEventListener('auth:user-updated', handleUserUpdate);
    };
  }, [fetchUserDetails]);
  
  const login = useCallback(async (email, password) => {
    const res = await authLogin(email, password);
    const { token: access, refresh } = res.data;

    localStorage.setItem('token', access);
    localStorage.setItem('refresh_token', refresh);

    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    await fetchUserDetails();      // 1. Fetch user
    await preloadWorkspaces();     // 2. Preload workspaces
    return res;
  }, [fetchUserDetails, preloadWorkspaces]);

  const loginWithGoogle = useCallback(async (googleToken) => {
    // Gọi API google-login của backend
    const res = await api.post('/auth/google-login/', { token: googleToken });
    const { token: access, refresh, user: userData } = res.data;

    // Lưu token và cập nhật state
    localStorage.setItem('token', access);
    localStorage.setItem('refresh_token', refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    // Cập nhật user state trực tiếp từ response để UI nhanh hơn
    setUser({
      id: userData.id,
      email: userData.email,
      username: userData.username,
      role: userData.role,
      profile: userData.profile, // BE google-login trả kèm user -> có profile lồng bên trong
    });
    
    await preloadWorkspaces(); // Tải workspace
    return res;
  }, [preloadWorkspaces]);

  // -------------------SIGN UP----------------//
  const signup = useCallback(async (email, password) => {
    const res = await authRegister(email, password);
    const { token: access, refresh } = res.data;

    localStorage.setItem('token', access);
    localStorage.setItem('refresh_token', refresh);

    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    await fetchUserDetails();
    await preloadWorkspaces();
    return res;
  }, [fetchUserDetails, preloadWorkspaces]);

  // -------------------LOG OUT----------------//
  const logout = useCallback(() => {
    return authLogout()
      .then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');

        delete api.defaults.headers.common['Authorization'];

        setUser(null);
        setWorkspaces([]);
      })
      .catch(error => {
        console.error('Logout error:', error);
        // Vẫn dọn dẹp localStorage dù có lỗi
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, signup, workspaces, 
      loginWithGoogle // 👈 Thêm hàm vào provider
    }}>
      {children}
    </AuthContext.Provider>
  );
}