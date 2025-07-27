// src/api/cardApi.js
import api from './axiosClient';

/**
 * Tạo card trong một list
 */
export const createCard = (listId, data) =>
  api.post(`/lists/${listId}/cards/`, data);

/**
 * Cập nhật card
 */
export const updateCard = (cardId, data) =>
  api.patch(`/cards/${cardId}/`, data);

/**
 * Xóa card
 */
export const deleteCard = (cardId) =>
  api.delete(`/cards/${cardId}/`);
