import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types'; // Best practice: Check kiểu dữ liệu đầu vào
import { login as authLogin, logout as authLogout, register as authRegister } from '../api/authApi';
import { fetchWorkspaces } from '../api/workspaceApi';
import api from '../api/apiClient'; 
import { TokenManager } from '../api/tokenManager';
// import * as recentBoardsUtil from '../utils/recentBoards'; // Uncomment nếu dùng

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaTempToken, setMfaTempToken] = useState(null);
  
  // 1. Hàm fetch user (giữ nguyên logic tốt của bạn)
  const fetchUserDetails = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me/');
      setUser({
        id: data.id,
        email: data.email,
        username: data.username,
        role: data.role || 'user',
        profile: data.profile,
        mfa_enabled: data.mfa_enabled || false,
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      // Nếu token hết hạn hoặc lỗi auth, clear luôn để tránh loop
      TokenManager.clearTokens();
      setUser(null);
    } finally {
      // Quan trọng: Luôn tắt loading dù thành công hay thất bại
      setLoading(false);
    }
  }, []);

  const preloadWorkspaces = useCallback(async () => {
    try {
      const res = await fetchWorkspaces();
      setWorkspaces(res.data || []);
    } catch (err) {
      console.error('Failed to preload workspaces:', err);
      // Không throw lỗi ở đây để tránh chặn quy trình login chính
    }
  }, []);

  // 2. Init App Check (Khớp hoàn hảo với PrivateRoute)
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

  // 3. Event Listeners (Giữ nguyên - rất tốt)
  useEffect(() => {
    const handleUserUpdate = () => fetchUserDetails();
    const onUnauthorized = () => {
      setUser(null);
      TokenManager.clearTokens();
      delete api.defaults.headers.common['Authorization'];
    };

    window.addEventListener('auth:user-updated', handleUserUpdate);
    window.addEventListener('unauthorized', onUnauthorized);
    
    return () => {
      window.removeEventListener('auth:user-updated', handleUserUpdate);
      window.removeEventListener('unauthorized', onUnauthorized);
    };
  }, [fetchUserDetails]);

  // 4. Login Logic
  const login = useCallback(async (email, password, remember = false) => {
    try {
      const data = await authLogin({ email, password });
      
      if (data.mfa_required) {
        setMfaRequired(true);
        setMfaTempToken(data.temp_token);
        return { mfaRequired: true };
      }

      const { token: access, refresh } = data;
      TokenManager.setTokens(access, refresh, remember);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      // Chạy song song để tiết kiệm thời gian
      await Promise.all([fetchUserDetails(), preloadWorkspaces()]);
      return { success: true };
    } catch (error) {
      throw error; // Ném lỗi để UI xử lý (hiện thông báo)
    }
  }, [fetchUserDetails, preloadWorkspaces]);

  // 5. MFA Logic
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
      
      await Promise.all([fetchUserDetails(), preloadWorkspaces()]);
      return { success: true };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Invalid MFA code');
    }
  }, [mfaTempToken, fetchUserDetails, preloadWorkspaces]);
  
  // 6. Google Login
  const loginWithGoogle = useCallback(async (googleToken) => {
    const res = await api.post('/auth/google-login/', { token: googleToken });
    const { token: access, refresh, user: userData } = res.data;

    TokenManager.setTokens(access, refresh, true);
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

  // 7. Signup
  const signup = useCallback(async (email, password) => {
    const data = await authRegister({ email, password }); 
    const { token: access, refresh } = data;

    TokenManager.setTokens(access, refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    await Promise.all([fetchUserDetails(), preloadWorkspaces()]);
    return true;
  }, [fetchUserDetails, preloadWorkspaces]);

  // 8. Logout (Optimized)
  const logout = useCallback(async () => {
    // Clear client state NGAY LẬP TỨC để UI phản hồi nhanh
    TokenManager.clearTokens();
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setWorkspaces([]);
    setMfaRequired(false);
    setMfaTempToken(null);

    try {
      // Gọi API logout chạy nền (fire and forget hoặc await đều được)
      await authLogout();
    } catch (error) {
      console.warn('Logout API failed (client already cleared):', error);
    }
  }, []);

  // 9. MEMOIZATION (CRITICAL FOR PERFORMANCE)
  // Gom nhóm các giá trị vào useMemo để tránh re-render consumers không cần thiết
  const contextValue = useMemo(() => ({
    user, 
    loading, 
    workspaces, 
    mfaRequired,
    login, 
    logout, 
    signup, 
    loginWithGoogle,
    completeMFALogin,
  }), [user, loading, workspaces, mfaRequired, login, logout, signup, loginWithGoogle, completeMFALogin]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Thêm PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};