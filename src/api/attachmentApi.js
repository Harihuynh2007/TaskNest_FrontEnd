// Dùng axios instance từ apiClient
import client from './apiClient';

// GET /cards/{id}/attachments/  (backend hỗ trợ pagination)
export async function getCardAttachments(cardId, { limit, offset } = {}) {
  const { data } = await client.get(`/cards/${cardId}/attachments/`, {
    params: { limit, offset }
  });
  // Trả về mảng: ưu tiên data.results nếu có, fallback về data
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function updateAttachment(attachmentId, payload) {
  const { data } = await client.patch(`/attachments/${attachmentId}/`, payload);
  return data;
}

export async function deleteAttachment(attachmentId) {
  await client.delete(`/attachments/${attachmentId}/`);
  return true;
}
