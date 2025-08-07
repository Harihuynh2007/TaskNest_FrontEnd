// src/api/boardApi.js
import api from './apiClient';
// ✅ Import cả `boards` và `workspaces` từ apiRoutes
import { workspaces, boards } from './apiRoutes';

/**
 * Lấy danh sách các board đang hoạt động trong một workspace.
 */
export const fetchBoards = (workspaceId) =>
  api.get(workspaces.boards(workspaceId));

/**
 * Tạo một board mới trong một workspace.
 */
export const createBoard = (workspaceId, data) =>
  api.post(workspaces.boards(workspaceId), data);

/**
 * Lấy thông tin chi tiết của một board.
 */
export const getBoard = (workspaceId, boardId) =>
  api.get(workspaces.boardDetail(workspaceId, boardId));

/**
 * Cập nhật thông tin của một board (ví dụ: đóng board).
 */
export const updateBoard = (workspaceId, boardId, data) =>
  api.patch(workspaces.boardDetail(workspaceId, boardId), data);

/**
 * Lấy danh sách các thành viên của một board.
 */
export const fetchBoardMembers = (boardId) =>
  api.get(boards.members(boardId));

/**
 * Lấy danh sách các nhãn của một board.
 */
export const fetchBoardLabels = (boardId) =>
  api.get(boards.labels(boardId));

/**
 * Thêm một thành viên mới vào board.
 */
export const addMemberToBoard = (boardId, userId) =>
  api.post(boards.members(boardId), { user_id: userId });

/**
 * Lấy danh sách tất cả các board đã bị đóng mà người dùng có quyền truy cập.
 */
export const getClosedBoards = () =>
  api.get(boards.closed());

/**
 * Xóa vĩnh viễn một board.
 * Đây là một hành động nguy hiểm và không thể hoàn tác.
 */
export const deleteBoard = (workspaceId, boardId) =>
  api.delete(workspaces.boardDetail(workspaceId, boardId));