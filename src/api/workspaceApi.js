import api from './apiClient';
import { workspaces as routes } from './apiRoutes';

/**
 * Lấy danh sách tất cả workspaces của user hiện tại.
 */
export const fetchWorkspaces = () => api.get(routes.list());

/**
 * Tạo một workspace mới.
 * @param {object} data - Dữ liệu của workspace (ví dụ: { name: 'My New Workspace' })
 */
export const createWorkspace = (data) => api.post(routes.list(), data);

/**
 * Lấy thông tin chi tiết của một workspace cụ thể.
 * @param {string} workspaceId - ID của workspace.
 */
export const fetchWorkspaceDetails = (workspaceId) => api.get(routes.detail(workspaceId));

/**
 * Cập nhật thông tin của một workspace.
 * @param {string} workspaceId - ID của workspace.
 * @param {object} data - Dữ liệu cần cập nhật.
 */
export const updateWorkspace = (workspaceId, data) => api.patch(routes.detail(workspaceId), data);

/**
 * Xóa một workspace.
 * @param {string} workspaceId - ID của workspace.
 */
export const deleteWorkspace = (workspaceId) => api.delete(routes.detail(workspaceId));

/**
 * Lấy danh sách thành viên của một workspace.
 * @param {string} workspaceId - ID của workspace.
 */
export const fetchWorkspaceMembers = (workspaceId) => api.get(routes.members(workspaceId));

/**
 * Mời một thành viên mới vào workspace.
 * @param {string} workspaceId - ID của workspace.
 * @param {object} data - Dữ liệu mời (ví dụ: { email: 'user@example.com' })
 */
export const inviteMember = (workspaceId, data) => api.post(routes.inviteMember(workspaceId), data);

/**
 * Lấy danh sách các board thuộc về một workspace.
 * @param {string} workspaceId - ID của workspace.
 */
export const fetchBoardsInWorkspace = (workspaceId) => api.get(routes.boards(workspaceId));

// Share links
export const listShareLinks = (workspaceId) =>
  api.get(routes.shareLinks(workspaceId));

export const createShareLink = (workspaceId, payload /* {role, expires_at, max_uses, domain_restriction} */) =>
  api.post(routes.shareLinks(workspaceId), payload);

export const updateShareLink = (token, patch /* {enabled, expires_at, max_uses, domain_restriction, role} */) =>
  api.patch(routes.shareLinkDetail(token), patch);

export const deleteShareLink = (token) =>
  api.delete(routes.shareLinkDetail(token));

export const joinWorkspaceByLink = (token) =>
  api.post(routes.joinByLink(token));

// (tuỳ chọn) invites accept/revoke cho trang accept-invite
export const acceptInvite = (token) => api.post(routes.inviteAccept(token));
export const revokeInvite = (token) => api.post(routes.inviteRevoke(token));
