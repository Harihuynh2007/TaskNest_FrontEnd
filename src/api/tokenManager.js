export const TokenManager = {
  getAccessToken: () => localStorage.getItem('token'),
  
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  },
  
  clearTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  },
  
  hasValidTokens: () => {
    return !!(TokenManager.getAccessToken() && TokenManager.getRefreshToken());
  },

  isTokenExpired: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
  
  shouldRefresh: () => {
    const token = TokenManager.getAccessToken();
    return token && TokenManager.isTokenExpired(token);
  }
};