export const TokenManager = {
  // CRITICAL: Support both localStorage and sessionStorage
  getStorage: () => {
    // Check if user chose "Remember Me"
    const persist = localStorage.getItem('persist_session');
    return persist === 'true' ? localStorage : sessionStorage;
  },

  getAccessToken: () => {
    const storage = TokenManager.getStorage();
    return storage.getItem('token') || 
           localStorage.getItem('token') || 
           sessionStorage.getItem('token');
  },
  
  getRefreshToken: () => {
    const storage = TokenManager.getStorage();
    return storage.getItem('refresh_token') ||
           localStorage.getItem('refresh_token') ||
           sessionStorage.getItem('refresh_token');
  },
  
  // ENHANCED: Support "Remember Me" via persist flag
  setTokens: (accessToken, refreshToken, persist = true) => {
    localStorage.setItem('persist_session', persist ? 'true' : 'false');
    
    const storage = persist ? localStorage : sessionStorage;
    storage.setItem('token', accessToken);
    
    if (refreshToken) {
      storage.setItem('refresh_token', refreshToken);
    }
    
    // Also set expiry tracking
    const decoded = TokenManager.decodeToken(accessToken);
    if (decoded?.exp) {
      storage.setItem('token_exp', decoded.exp.toString());
    }
  },
  
  clearTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_exp');
    localStorage.removeItem('persist_session');
    
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('token_exp');
  },
  
  hasValidTokens: () => {
    return !!(TokenManager.getAccessToken() && TokenManager.getRefreshToken());
  },

  // NEW: Decode JWT without verification (client-side only)
  decodeToken: (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  },

  isTokenExpired: (token) => {
    const decoded = TokenManager.decodeToken(token);
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now();
  },
  
  shouldRefresh: () => {
    const token = TokenManager.getAccessToken();
    if (!token) return false;
    
    const decoded = TokenManager.decodeToken(token);
    if (!decoded?.exp) return false;
    
    // Refresh if token expires in < 5 minutes
    const expiresIn = decoded.exp * 1000 - Date.now();
    return expiresIn < 15 * 60 * 1000;
  },

  // NEW: Get token expiry time
  getTokenExpiry: () => {
    const token = TokenManager.getAccessToken();
    const decoded = TokenManager.decodeToken(token);
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  },

  // NEW: Session management helpers
  getSessionId: () => {
    const token = TokenManager.getAccessToken();
    const decoded = TokenManager.decodeToken(token);
    return decoded?.session_id || null;
  },

  // NEW: Check if current device is remembered
  isDeviceRemembered: () => {
    return localStorage.getItem('persist_session') === 'true';
  },
};