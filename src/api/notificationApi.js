import api from './apiClient';
import { notifications as routes } from './apiRoutes';

// notificationApi.js
export const fetchNotifications = (params) => {
  const mapped = { ...params };
  // map is_read <-> status (đã có)
  if (Object.prototype.hasOwnProperty.call(mapped, 'is_read')) {
    if (mapped.is_read === false) { delete mapped.is_read; mapped.status = 'unread'; }
    else if (mapped.is_read === true) { delete mapped.is_read; mapped.status = 'read'; }
  }
  // NEW: map mentions tab nếu BE dùng 'kind=mention'
  if (mapped.mentions === true) {
    delete mapped.mentions;
    mapped.kind = 'mention'; // hoặc đổi theo BE: mapped.type = 'mention'
  }
  return api.get(routes.list(), { params: mapped });
};

export const getUnreadCount = () =>
  api.get(routes.unreadCount()).then(res => ({ data: { count: res.data?.unread ?? 0 } }));

export const markAsRead = (id, is_read = true) =>
  api.patch(`${routes.detail(id)}read/`, { is_read });

export const markAllAsRead = () => api.post(routes.markAllRead());
