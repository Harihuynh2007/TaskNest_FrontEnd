// src/api/boardApi.js
import api from './apiClient';
import { workspaces, boards } from './apiRoutes';

export const fetchBoards = (workspaceId) =>
  api.get(workspaces.boards(workspaceId));

export const createBoard = (workspaceId, data) =>
  api.post(workspaces.boards(workspaceId), data);

export const getBoard = (workspaceId, boardId) =>
  api.get(workspaces.boardDetail(workspaceId, boardId));

export const fetchBoardMembers = (boardId) =>
  api.get(boards.members(boardId));

export const fetchBoardLabels = (boardId) =>
  api.get(boards.labels(boardId));

export const addMemberToBoard = (boardId, userId) =>
  api.post(boards.members(boardId), { user_id: userId });