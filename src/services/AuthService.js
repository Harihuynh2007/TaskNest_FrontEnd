// src/services/authService.js
import API from './api';

/**
 * POST /api/auth/login/
 * @returns {Promise<{ token: string, user: object }>}
 */
export const login = (email, password) =>
  API.post('/auth/login/', { email, password });

/** POST /api/auth/logout/ */
export const logout = () =>
  API.post('/auth/logout/');

/**
 * POST /api/auth/register/
 * @returns {Promise<{ token: string, user: object }>}
 */
export const register = (email, password) =>
  API.post('/auth/register/', { email, password });
