import api from './apiClient';
import { notifications as routes } from './apiRoutes';

export const fetchNotifications = (params) => api.get(routes.list(), { params });
export const markAsRead = (id) => api.patch(routes.detail(id), { is_read: true });
export const markAllAsRead = () => api.post(routes.markAllRead());
export const getUnreadCount = () => api.get(routes.unreadCount());