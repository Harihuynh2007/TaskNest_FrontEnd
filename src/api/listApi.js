import api from './apiClient';

export const fetchLists = (boardId) => api.get(`/boards/${boardId}/lists/`);

export const createList = (boardId, data) =>
  api.post(`/boards/${boardId}/lists/`, data);

export const updateList = (listId, data) =>
  api.patch(`/lists/${listId}/`, data);

export const deleteList = (listId) =>
  api.delete(`/lists/${listId}/`);