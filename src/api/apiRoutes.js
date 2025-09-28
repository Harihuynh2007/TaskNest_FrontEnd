// src/api/apiRoutes.js

// Auth Routes
export const auth = {
  login: () => '/auth/login/',
  register: () => '/auth/register/',
  logout: () => '/auth/logout/',
  switchAccount: () => '/auth/switch-account/',
};

// Workspace & Board Routes
export const workspaces = {
  list: () => '/workspaces/', // GET, POST

  // 1. Lấy chi tiết, cập nhật, hoặc xóa một workspace cụ thể
  detail: (workspaceId) => `/workspaces/${workspaceId}/`, 

  // 2. Lấy danh sách thành viên của một workspace
  members: (workspaceId) => `/workspaces/${workspaceId}/members/`,

  // 3. Mời thành viên mới vào workspace
  inviteMember: (workspaceId) => `/workspaces/${workspaceId}/invite/`, // POST

  // 4. Lấy danh sách boards của một workspace (bạn đã có)
  boards: (workspaceId) => `/workspaces/${workspaceId}/boards/`, // GET, POST

  boardDetail: (workspaceId, boardId) => `/workspaces/${workspaceId}/boards/${boardId}/`, // GET

  // 5 . Share Links
  shareLinks: (workspaceId) => `/workspaces/${workspaceId}/share-links/`,   
  shareLinkDetail: (token) => `/workspaces/share-links/${token}/`,         
  joinByLink: (token) => `/workspaces/join-by-link/${token}/`,  

  // 6 . Invites accept/revoke 
  inviteAccept: (token) => `/workspaces/invites/${token}/accept/`,          
  inviteRevoke: (token) => `/workspaces/invites/${token}/revoke/`, 
};

// Board specific resources
export const boards = {
  // Lấy/Tạo List (cột) trong một board
  lists: (boardId) => `/boards/${boardId}/lists/`,
  // Lấy/Tạo Label trong một board
  labels: (boardId) => `/boards/${boardId}/labels/`,
  // Quản lý thành viên của board
  members: (boardId) => `/boards/${boardId}/members/`,
  closed: () => '/boards/closed/',
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