import api from './apiClient';

export const fetchCards = (listId) =>
  api.get(`/lists/${listId}/cards/`);

export const fetchInboxCards = () =>
  api.get(`/cards/`);

export const createCard = (listId, data) => {
  if (listId !== null) {
    return api.post(`/lists/${listId}/cards/`, data);
  } else {
    return api.post(`/cards/`, data);
  }
};

export const updateCard = (cardId, data) =>
  api.patch(`/cards/${cardId}/`, data);

export const deleteCard = (cardId) =>
  api.delete(`/cards/${cardId}/`);