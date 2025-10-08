// src/api/apiRoutes.js

export const auth = {
  login:          () => '/auth/login/',
  register:       () => '/auth/register/',
  logout:         () => '/auth/logout/',
  me:             () => '/auth/me/',
  profile:        () => '/auth/me/profile/',
  changePassword: () => '/auth/change-password/',
  searchUsers:    () => '/auth/users/search/',
  refreshToken:   () => '/token/refresh/',
};

export const workspaces = {
  list:           () => '/workspaces/',
  detail:         (workspaceId) => `/workspaces/${workspaceId}/`,
  members:        (workspaceId) => `/workspaces/${workspaceId}/members/`,
  boards:         (workspaceId) => `/workspaces/${workspaceId}/boards/`,
  boardDetail:    (workspaceId, boardId) => `/workspaces/${workspaceId}/boards/${boardId}/`,

  shareLinks:     (workspaceId) => `/workspaces/${workspaceId}/share-links/`,
  shareLinkDetail:(token) => `/workspaces/share-links/${token}/`,
  joinByLink:     (token) => `/workspaces/join-by-link/${token}/`,

  inviteMember:   (workspaceId) => `/workspaces/${workspaceId}/invite/`,
  inviteAccept:   (token) => `/workspaces/invites/${token}/accept/`,
  inviteRevoke:   (token) => `/workspaces/invites/${token}/revoke/`,
};

export const boards = {
  closed:            () => '/boards/closed/',
  lists:             (boardId) => `/boards/${boardId}/lists/`,
  labels:            (boardId) => `/boards/${boardId}/labels/`,
  members:           (boardId) => `/boards/${boardId}/members/`,
  invitations:       (boardId) => `/boards/${boardId}/invitations/`,
  shareLink:         (boardId) => `/boards/${boardId}/share-link/`,
  joinByToken:       (token) => `/boards/join/${token}/`,
  transferOwnership: (workspaceId, boardId) => `/workspaces/${workspaceId}/boards/${boardId}/transfer-owner/`,
};

export const lists = {
  detail: (listId) => `/lists/${listId}/`,
  cards:  (listId) => `/lists/${listId}/cards/`,
};

export const cards = {
  inbox:        () => '/cards/',
  detail:       (cardId) => `/cards/${cardId}/`,
  batchUpdate:  () => '/cards/batch-update/',
  comments:     (cardId) => `/cards/${cardId}/comments/`,
  attachments:  (cardId) => `/cards/${cardId}/attachments/`,
  activities:   (cardId) => `/cards/${cardId}/activities/`,
  checklists:   (cardId) => `/cards/${cardId}/checklists/`,
};

export const comments = {
  detail: (commentId) => `/comments/${commentId}/`,
};

export const attachments = {
  detail: (attachmentId) => `/attachments/${attachmentId}/`,
};

export const checklists = {
  detail:       (checklistId) => `/checklists/${checklistId}/`,
  items:        (checklistId) => `/checklists/${checklistId}/items/`,
  reorderItems: (checklistId) => `/checklists/${checklistId}/reorder-items/`,
  copy:         (checklistId) => `/checklists/${checklistId}/copy/`,
};

export const checklistItems = {
  detail:        (itemId) => `/checklist-items/${itemId}/`,
  convertToCard: (itemId) => `/checklist-items/${itemId}/convert-to-card/`,
};

export const labels = {
  detail: (labelId) => `/labels/${labelId}/`,
};

export const notifications = {
  list:        () => '/notifications/',
  detail:      (id) => `/notifications/${id}/`,
  markAllRead: () => '/notifications/mark-all-read/',
  unreadCount: () => '/notifications/unread-count/',
};