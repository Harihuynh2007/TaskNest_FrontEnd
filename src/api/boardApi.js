// src/api/boardApi.js
import api from './axiosClient';

export const fetchBoards = workspaceId =>
  api.get(`/workspaces/${workspaceId}/boards/`);

export const createBoard = (workspaceId, data) =>
  api.post(`/workspaces/${workspaceId}/boards/`, data);

export const getBoard = (workspaceId, boardId) =>
  api.get(`/workspaces/${workspaceId}/boards/${boardId}/`);

export const fetchBoardMembers = (boardId) =>
  api.get(`/boards/${boardId}/members/`); // Giả định endpoint để lấy danh sách thành viên

export const fetchBoardLabels = (boardId) =>
  api.get(`/boards/${boardId}/labels/`); // G

export const addMemberToBoard = (boardId, userId) =>
  api.post(`/boards/${boardId}/add-member/`, { user_id: userId });