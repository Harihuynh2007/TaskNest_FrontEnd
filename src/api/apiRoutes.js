// src/api/apiRoutes.js

// Auth Routes
export const auth = {
  login: () => '/auth/login/',
  register: () => '/auth/register/',
  logout: () => '/auth/logout/',
  switchAccount: () => '/auth/switch-account/',
};



// Board specific resources
export const boards = {
  list: () => '/boards/', // Lấy danh sách boards
  // Lấy/Tạo List (cột) trong một board
  lists: (boardId) => `/boards/${boardId}/lists/`,
  // Lấy/Tạo Label trong một board
  labels: (boardId) => `/boards/${boardId}/labels/`,
  // Quản lý thành viên của board
  members: (boardId) => `/boards/${boardId}/members/`,
  closed: () => '/boards/closed/',
  detail: (boardId) => `/boards/${boardId}/`, // Lấy thông tin chi tiết của board
};

// List (Column) Routes
export const lists = {
  // Cập nhật/Xóa một List cụ thể
  detail: (listId) => `/lists/${listId}/`,
  // Lấy/Tạo card trong một list cụ thể
  cards: (listId) => `/lists/${listId}/cards/`,
};

// Card Routes
export const cards = {
  // Tạo hoặc lấy các card trong Inbox (list is null)
  inbox: () => `/cards/`,
  // Cập nhật/Xóa một card cụ thể
  detail: (cardId) => `/cards/${cardId}/`,
  // Endpoint đặc biệt để cập nhật nhiều card cùng lúc (cho drag-and-drop)
  batchUpdate: () => '/cards/batch-update/',
};

// Label Routes
export const labels = {
    // Cập nhật/Xóa một label cụ thể
    detail: (labelId) => `/labels/${labelId}/`,
};