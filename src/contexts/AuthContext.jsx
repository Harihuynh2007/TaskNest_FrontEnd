
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login as authLogin, logout as authLogout, register as authRegister } from '../api/authApi';
import { fetchWorkspaces } from '../api/workspaceApi';
import api from '../api/apiClient'; 
import { TokenManager } from '../api/tokenManager';
import * as recentBoardsUtil from '../utils/recentBoards';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaTempToken, setMfaTempToken] = useState(null);
  
  const fetchUserDetails = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me/');
      setUser({
        id: data.id,
        email: data.email,
        username: data.username,
        role: data.role || 'user',
        profile: data.profile,
        mfa_enabled: data.mfa_enabled || false, // NEW
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      TokenManager.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const preloadWorkspaces = useCallback(async () => {
    try {
      const res = await fetchWorkspaces();
      setWorkspaces(res.data || []);
    } catch (err) {
      console.error('Failed to preload workspaces:', err);
    }
  }, []);

  useEffect(() => {
    const token = TokenManager.getAccessToken();
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
      fetchUserDetails();
    };
    window.addEventListener('auth:user-updated', handleUserUpdate);
    return () => window.removeEventListener('auth:user-updated', handleUserUpdate);
  }, [fetchUserDetails]);
  
  //apiClient phát window.dispatchEvent('unauthorized') → Tránh kẹt “ghost session” khi refresh token hết hạn.
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      TokenManager.clearTokens();
      delete api.defaults.headers.common['Authorization'];
    };
    window.addEventListener('unauthorized', onUnauthorized);
    return () => window.removeEventListener('unauthorized', onUnauthorized);
  }, []);


  const login = useCallback(async (email, password, remember = false) => {
    const data = await authLogin({ email, password });
    
    // CRITICAL: Check if MFA required
    if (data.mfa_required) {
      setMfaRequired(true);
      setMfaTempToken(data.temp_token);
      return { mfaRequired: true };
    }

    const { token: access, refresh } = data;
    TokenManager.setTokens(access, refresh, remember); // Pass remember flag

    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    await fetchUserDetails();
    await preloadWorkspaces();
    return { success: true };
  }, [fetchUserDetails, preloadWorkspaces]);

  const completeMFALogin = useCallback(async (code) => {
    try {
      const res = await api.post('/auth/mfa/verify/', { 
        temp_token: mfaTempToken, 
        code 
      });
      
      const { token: access, refresh } = res.data;
      const remember = localStorage.getItem('persist_session') === 'true';
      TokenManager.setTokens(access, refresh, remember);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setMfaRequired(false);
      setMfaTempToken(null);
      
      await fetchUserDetails();
      await preloadWorkspaces();
      return { success: true };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Invalid MFA code');
    }
  }, [mfaTempToken, fetchUserDetails, preloadWorkspaces]);
  
  const loginWithGoogle = useCallback(async (googleToken) => {
    const res = await api.post('/auth/google-login/', { token: googleToken });
    const { token: access, refresh, user: userData } = res.data;

    TokenManager.setTokens(access, refresh, true); // Default remember for OAuth
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    setUser({
      id: userData.id,
      email: userData.email,
      username: userData.username,
      role: userData.role,
      profile: userData.profile,
      mfa_enabled: userData.mfa_enabled || false,
    });
    
    await preloadWorkspaces();
    return res;
  }, [preloadWorkspaces]);

  // -------------------SIGN UP----------------//
  const signup = useCallback(async (email, password) => {
    const data = await authRegister({ email, password }); 
    const { token: access, refresh } = data;

    TokenManager.setTokens(access, refresh);

    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    await fetchUserDetails();
    await preloadWorkspaces();
    return true;
  }, [fetchUserDetails, preloadWorkspaces]);

  // -------------------LOG OUT----------------//
  const logout = useCallback(() => {
    return authLogout()
      .then(() => {
        TokenManager.clearTokens();
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setWorkspaces([]);
        setMfaRequired(false);
        setMfaTempToken(null);
      })
      .catch(error => {
        console.error('Logout error:', error);
        TokenManager.clearTokens();
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, 
      loading, 
      login, 
      logout, 
      signup, 
      workspaces, 
      loginWithGoogle,
      mfaRequired,
      completeMFALogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}