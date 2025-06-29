// src/api/workspaceApi.js
import API from './apiClient';

export const fetchWorkspaces = () =>
  API.get('/workspaces/');
