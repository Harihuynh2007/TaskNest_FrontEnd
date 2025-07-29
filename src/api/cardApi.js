// src/api/cardApi.js
import api from './axiosClient';

export const fetchCards = (listId) =>
  api.get(`/lists/${listId}/cards/`);

export const fetchInboxCards = () =>
  api.get(`/cards/`); // cần backend filter nếu quá nhiều card toàn hệ thống

export const createCard = (listId, data) => {
  if (listId !== null) {
    return api.post(`/lists/${listId}/cards/`, data);
  } else {
    return api.post(`/cards/`, data); // API mới cho card không thuộc list
  }
};

export const updateCard = (cardId, data) =>
  api.patch(`/cards/${cardId}/`, data);

export const deleteCard = (cardId) =>
  api.delete(`/cards/${cardId}/`);
