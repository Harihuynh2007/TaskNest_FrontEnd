// src/services/workspacesService.js
import API from './api';

// gọi GET /api/workspaces/
export const fetchWorkspaces = () => {
  return API.get('/workspaces/');
};

