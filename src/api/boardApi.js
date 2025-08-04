import api from './apiClient';

export const fetchBoards = (workspaceId) =>
  api.get(`/workspaces/${workspaceId}/boards/`);

export const createBoard = (workspaceId, data) =>
  api.post(`/workspaces/${workspaceId}/boards/`, data);

export const getBoard = (workspaceId, boardId) =>
  api.get(`/workspaces/${workspaceId}/boards/${boardId}/`);

export const fetchBoardMembers = (boardId) =>
  api.get(`/boards/${boardId}/members/`);

export const fetchBoardLabels = (boardId) =>
  api.get(`/boards/${boardId}/labels/`);

export const addMemberToBoard = (boardId, userId) =>
  api.post(`/boards/${boardId}/add-member/`, { user_id: userId });