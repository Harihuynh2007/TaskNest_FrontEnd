import api from './apiClient';

// Checklist CRUD
export const createChecklist = async (cardId, data) => {
  const response = await api.post(`/cards/${cardId}/checklists/`, data);
  return response.data;
};

export const getCardChecklists = async (cardId) => {
  const response = await api.get(`/cards/${cardId}/checklists/`);
  return response.data;
};

export const updateChecklist = async (checklistId, data) => {
  const response = await api.patch(`/checklists/${checklistId}/`, data);
  return response.data;
};

export const deleteChecklist = async (checklistId) => {
  await api.delete(`/checklists/${checklistId}/`);
};

// Checklist Item CRUD
export const createChecklistItem = async (checklistId, data) => {
  const response = await api.post(`/checklists/${checklistId}/items/`, data);
  return response.data;
};

export const updateChecklistItem = async (itemId, data) => {
  const response = await api.patch(`/checklist-items/${itemId}/`, data);
  return response.data;
};

export const deleteChecklistItem = async (itemId) => {
  await api.delete(`/checklist-items/${itemId}/`);
};

export const toggleChecklistItem = async (itemId, completed) => {
  return (await api.patch(`/checklist-items/${itemId}/`, { completed })).data;
};

export const reorderChecklistItems = async (checklistId, itemIds) => {
  const response = await api.patch(`/checklists/${checklistId}/reorder-items/`, {
    item_ids: itemIds
  });
  return response.data;
};

// Bulk operations
export const convertToCard = async (itemId, listId) => {
  const response = await api.post(`/checklist-items/${itemId}/convert-to-card/`, {
    list_id: listId
  });
  return response.data;
};

export const copyChecklistToCard = async (checklistId, targetCardId) => {
  const response = await api.post(`/checklists/${checklistId}/copy/`, {
    target_card_id: targetCardId
  });
  return response.data;
};