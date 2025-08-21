import apiClient from './apiClient';

// Checklist CRUD
export const createChecklist = async (cardId, data) => {
  const response = await apiClient.post(`/cards/${cardId}/checklists/`, data);
  return response.data;
};

export const getCardChecklists = async (cardId) => {
  const response = await apiClient.get(`/cards/${cardId}/checklists/`);
  return response.data;
};

export const updateChecklist = async (checklistId, data) => {
  const response = await apiClient.patch(`/checklists/${checklistId}/`, data);
  return response.data;
};

export const deleteChecklist = async (checklistId) => {
  await apiClient.delete(`/checklists/${checklistId}/`);
};

// Checklist Item CRUD
export const createChecklistItem = async (checklistId, data) => {
  const response = await apiClient.post(`/checklists/${checklistId}/items/`, data);
  return response.data;
};

export const updateChecklistItem = async (itemId, data) => {
  const response = await apiClient.patch(`/checklist-items/${itemId}/`, data);
  return response.data;
};

export const deleteChecklistItem = async (itemId) => {
  await apiClient.delete(`/checklist-items/${itemId}/`);
};

export const toggleChecklistItem = async (itemId, completed) => {
  return (await apiClient.patch(`/checklist-items/${itemId}/`, { completed })).data;
};

export const reorderChecklistItems = async (checklistId, itemIds) => {
  const response = await apiClient.patch(`/checklists/${checklistId}/reorder-items/`, {
    item_ids: itemIds
  });
  return response.data;
};

// Bulk operations
export const convertToCard = async (itemId, listId) => {
  const response = await apiClient.post(`/checklist-items/${itemId}/convert-to-card/`, {
    list_id: listId
  });
  return response.data;
};

export const copyChecklistToCard = async (checklistId, targetCardId) => {
  const response = await apiClient.post(`/checklists/${checklistId}/copy/`, {
    target_card_id: targetCardId
  });
  return response.data;
};