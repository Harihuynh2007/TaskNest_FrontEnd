// src/api/cardApi.js
import { data } from 'react-router-dom';
import api from './axiosClient';

//hiển thị các card đang có trong list
export const fetchCards = (listId) => api.get(`/lists/${listId}/cards/`)
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
