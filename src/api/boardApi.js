// src/api/boardApi.js
import API from './apiClient';

export const fetchBoards = workspaceId =>
  API.get(`/workspaces/${workspaceId}/boards/`);

export const createBoard = (workspaceId, data) =>
  API.post(`/workspaces/${workspaceId}/boards/`, data);
