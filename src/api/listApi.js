
import api from './axiosClient';

/**
 * Lấy tất cả lists của một board
 */
export const fetchLists = (boardId) => api.get(`/boards/${boardId}/lists/`);

/**
 * Tạo một list mới trong board
 */
export const createList = (boardId, data) =>
  api.post(`/boards/${boardId}/lists/`, data);

/**
 * Cập nhật 1 list
 */
export const updateList = (listId, data) =>
  api.patch(`/lists/${listId}/`, data);

/**
 * Xóa list
 */
export const deleteList = (listId) =>
  api.delete(`/lists/${listId}/`);
