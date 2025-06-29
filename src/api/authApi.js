// src/api/authApi.js
import API from './apiClient';

export const login = (email, password) =>
  API.post('/auth/login/', { email, password });

export const register = (email, password) =>
  API.post('/auth/register/', { email, password });

export const logout = () =>
  API.post('/auth/logout/');
