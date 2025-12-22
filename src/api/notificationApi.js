import api from './apiClient';
import { notifications as routes } from './apiRoutes';

// notificationApi.js

export const getUnreadCount = () =>
  api.get(routes.unreadCount()).then(res => ({ data: { count: res.data?.unread ?? 0 } }));

export const markAsRead = (id, is_read = true) =>
  api.patch(`${routes.detail(id)}read/`, { is_read });

export const markAllAsRead = () => api.post(routes.markAllRead());

export async function fetchNotifications(params = {}) {
  const res = await api.get("/notifications/", { params });
  const data = res.data;
  return Array.isArray(data) ? data : (data.results || []);
}

export async function fetchUnreadCount() {
  const res = await api.get("/notifications/unread-count/");
  return res.data?.count ?? 0;
}

export async function markNotificationRead(id) {
  const res = await api.patch(`/notifications/${id}/read/`, { is_read: true });
  return res.data;
}

export async function markAllRead() {
  const res = await api.post("/notifications/mark-all-read/");
  return res.data;
}