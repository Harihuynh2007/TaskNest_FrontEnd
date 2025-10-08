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
  }
};