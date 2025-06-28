// src/services/boardsService.js
import API from './api';

export const fetchBoards = workspaceId =>
  API.get(`/workspaces/${workspaceId}/boards/`);

export const createBoard = (workspaceId, data) =>
  API.post(`/workspaces/${workspaceId}/boards/`, data);

// ...export thêm fetchArchivedBoards, fetchBoardDetail, v.v.
