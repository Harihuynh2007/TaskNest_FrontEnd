// src/api/workspaceApi.js
import api from './apiClient';
import { workspaces as routes } from './apiRoutes';

// ==================== BASIC WORKSPACE CRUD ====================

/** Get all workspaces the current user can access. */
export const fetchWorkspaces = () => api.get(routes.list());

/** Create a workspace.
 * @param {object} data - { name: string, description?: string }
 * @returns {Promise<object>}
 */
export const createWorkspace = (data) => api.post(routes.list(), data);

/** Get workspace details.
 * @param {string|number} workspaceId
 * @returns {Promise<object>}
 */
export const fetchWorkspaceDetails = (workspaceId) =>
  api.get(routes.detail(workspaceId));

/** Update a workspace.
 * @param {string|number} workspaceId
 * @param {object} data - Partial fields to update
 * @returns {Promise<object>}
 */
export const updateWorkspace = (workspaceId, data) =>
  api.patch(routes.detail(workspaceId), data);

/** Delete a workspace.
 * @param {string|number} workspaceId
 * @returns {Promise<void>}
 */
export const deleteWorkspace = (workspaceId) =>
  api.delete(routes.detail(workspaceId));

// ==================== MEMBER MANAGEMENT ====================

/** List members in a workspace.
 * @param {string|number} workspaceId
 * @param {object} params - Query parameters (search, role, page, page_size)
 * @returns {Promise<Array>}
 */
export const fetchWorkspaceMembers = (workspaceId, params = {}) =>
  api.get(routes.members(workspaceId), { params });

/** Invite a member by email.
 * @param {string|number} workspaceId
 * @param {object} data - { email: string, role?: 'admin'|'member' }
 * @returns {Promise<object>}
 */
export const inviteMember = (workspaceId, data) =>
  api.post(`/workspaces/${workspaceId}/members/`, data);


/** Update member role.
 * @param {string|number} workspaceId
 * @param {string|number} memberId
 * @param {string} role - 'admin' | 'member'
 * @returns {Promise<object>}
 */
export const updateMemberRole = (workspaceId, memberId, role) =>
  api.patch(`/workspaces/${workspaceId}/members/${memberId}/`, { role });

/** Remove a member from workspace.
 * @param {string|number} workspaceId
 * @param {string|number} memberId
 * @returns {Promise<void>}
 */
export const removeMember = (workspaceId, memberId) =>
  api.delete(`/workspaces/${workspaceId}/members/${memberId}/`);

/** Leave workspace (for non-owners).
 * @param {string|number} workspaceId
 * @returns {Promise<object>}
 */
export const leaveWorkspace = (workspaceId) =>
  api.post(`/workspaces/${workspaceId}/leave/`);

// ==================== SHARE LINKS ====================

/** List all share links for a workspace.
 * @param {string|number} workspaceId
 * @returns {Promise<Array>}
 */
export const listShareLinks = (workspaceId) =>
  api.get(routes.shareLinks(workspaceId));

/** Create a share link.
 * @param {string|number} workspaceId
 * @param {object} payload - { role, expires_at?, max_uses?, domain_restriction? }
 * @returns {Promise<object>}
 */
export const createShareLink = (workspaceId, payload) =>
  api.post(routes.shareLinks(workspaceId), payload);

/** Update a share link.
 * @param {string|number} workspaceId
 * @param {string|number} linkId
 * @param {object} patch - { enabled?, expires_at?, max_uses?, role? }
 * @returns {Promise<object>}
 */
export const updateShareLink = (workspaceId, linkId, patch) =>
  api.patch(`/workspaces/${workspaceId}/share-links/${linkId}/`, patch);

/** Delete a share link.
 * @param {string|number} workspaceId
 * @param {string|number} linkId
 * @returns {Promise<void>}
 */
export const deleteShareLink = (workspaceId, linkId) =>
  api.delete(`/workspaces/${workspaceId}/share-links/${linkId}/`);

/** Join a workspace via share link.
 * @param {string} token - Share link token
 * @returns {Promise<object>}
 */
export const joinWorkspaceByLink = (token) =>
  api.post(routes.joinByLink(token));

// ==================== INVITATIONS ====================

/** Accept a workspace invite.
 * @param {string} token - Invitation token
 * @returns {Promise<object>}
 */
export const acceptInvite = (token) =>
  api.post(routes.inviteAccept(token));

/** Revoke a workspace invite.
 * @param {string} token - Invitation token
 * @returns {Promise<void>}
 */
export const revokeInvite = (token) =>
  api.post(routes.inviteRevoke(token));

// ==================== OWNERSHIP & PERMISSIONS ====================

/** Transfer workspace ownership.
 * @param {string|number} workspaceId
 * @param {number} newOwnerId - User ID of new owner (must be admin)
 * @returns {Promise<object>}
 */
export const transferOwnership = (workspaceId, newOwnerId) =>
  api.post(`/workspaces/${workspaceId}/transfer-ownership/`, { 
    new_owner_id: newOwnerId 
  });

// ==================== BOARDS ====================

/** List boards in a workspace that the user can see.
 * Server applies visibility/role/membership filters.
 * @param {string|number} workspaceId
 * @returns {Promise<Array>}
 */
export const fetchBoardsInWorkspace = (workspaceId) =>
  api.get(routes.boards(workspaceId));

// ==================== ACTIVITY LOG ====================

/** Get workspace activity log.
 * @param {string|number} workspaceId
 * @param {object} params - { page?, page_size?, activity_type?, user_id?, from_date?, to_date? }
 * @returns {Promise<object>} - Paginated response
 */
export const fetchActivities = (workspaceId, params = {}) =>
  api.get(`/workspaces/${workspaceId}/activities/`, { params });

// ==================== DATA EXPORT ====================

/** Request workspace data export.
 * @param {string|number} workspaceId
 * @param {object} options - { include_boards?, include_cards?, include_comments?, include_attachments?, format? }
 * @returns {Promise<object>} - { export_id, status, message }
 */
export const exportWorkspaceData = (workspaceId, options = {}) =>
  api.post(`/workspaces/${workspaceId}/export/`, options);

/** Get export status.
 * @param {string|number} workspaceId
 * @param {string} exportId
 * @returns {Promise<object>} - { export_id, status, download_url?, ... }
 */
export const getExportStatus = (workspaceId, exportId) =>
  api.get(`/workspaces/${workspaceId}/exports/${exportId}/`);

// ==================== HELPER FUNCTIONS ====================

/** Is user an admin in this workspace?
 * @param {Array} members - Array of workspace members
 * @param {number} userId - User ID to check
 * @returns {boolean}
 */
export const isWorkspaceAdmin = (members, userId) => {
  if (!members || !Array.isArray(members) || !userId) return false;
  
  const membership = members.find(m => {
    const memberId = m.user?.id || m.user_id;
    return String(memberId) === String(userId);
  });
  
  return membership?.role === 'admin';
};

/** Is user the workspace owner?
 * @param {object} workspace - Workspace object
 * @param {number} userId - User ID to check
 * @returns {boolean}
 */
export const isWorkspaceOwner = (workspace, userId) => {
  if (!workspace || !userId) return false;
  
  // Ưu tiên check is_owner từ API (đã tính sẵn ở backend)
  if (workspace.is_owner === true) return true;
  
  // Fallback: check effective_role
  if (workspace.effective_role === 'owner') return true;
  
  // Fallback: so sánh owner_id
  if (workspace.owner_id && String(workspace.owner_id) === String(userId)) {
    return true;
  }
  
  // Legacy: check owner object (nếu backend trả về owner object)
  if (workspace.owner?.id && String(workspace.owner.id) === String(userId)) {
    return true;
  }
  
  return false;
};

/** Can user create a board in this workspace?
 * Checks workspace policy and user role.
 * @param {object} workspace - Workspace object
 * @param {Array} members - Array of workspace members
 * @param {number} userId - User ID to check
 * @returns {boolean}
 */
export const canCreateBoard = (workspace, members, userId) => {
  if (!workspace || !members || !Array.isArray(members) || !userId) return false;
  
  const isOwner = isWorkspaceOwner(workspace, userId);
  const isAdmin = isWorkspaceAdmin(members, userId);
  const isMember = members.some(m => m.user?.id === userId);
  
  const policy = workspace.board_creation_policy || 'members';
  
  switch (policy) {
    case 'owner':
      return isOwner;
    case 'admins':
      return isOwner || isAdmin;
    case 'members':
      return isOwner || isAdmin || isMember;
    default:
      return false;
  }
};
/** Get user's role in workspace.
 * @param {object} workspace - Workspace object
 * @param {Array} members - Array of workspace members
 * @param {number} userId - User ID to check
 * @returns {string|null} - 'owner' | 'admin' | 'member' | null
 */
export const getUserRole = (workspace, members, userId) => {
  if (isWorkspaceOwner(workspace, userId)) return 'owner';
  if (!members || !Array.isArray(members)) return null;
  const membership = members.find(m => m.user?.id === userId);
  return membership?.role || null;
};
/** Can user manage members (invite/remove/edit roles)?
 * @param {object} workspace - Workspace object
 * @param {Array} members - Array of workspace members
 * @param {number} userId - User ID to check
 * @returns {boolean}
 */
export const canManageMembers = (workspace, members, userId) => {
  return isWorkspaceOwner(workspace, userId) || isWorkspaceAdmin(members, userId);
};

/** Can user edit workspace settings?
 * @param {object} workspace - Workspace object
 * @param {Array} members - Array of workspace members
 * @param {number} userId - User ID to check
 * @returns {boolean}
 */
export const canEditWorkspace = (workspace, members, userId) => {
  return isWorkspaceOwner(workspace, userId) || isWorkspaceAdmin(members, userId);
};

/** Can user change workspace policies?
 * @param {object} workspace - Workspace object
 * @param {number} userId - User ID to check
 * @returns {boolean}
 */
export const canChangePolicies = (workspace, userId) => {
  return isWorkspaceOwner(workspace, userId);
};

// ==================== DEPRECATED (backward compatibility) ====================

/** @deprecated Use createShareLink instead */
export const createWorkspaceShareLink = async (workspaceId, options = {}) => {
  console.warn('createWorkspaceShareLink is deprecated. Use createShareLink instead.');
  return createShareLink(workspaceId, options);
};

// ==================== EXPORTS ====================

const workspaceApi = {
  // CRUD
  fetchWorkspaces,
  createWorkspace,
  fetchWorkspaceDetails,
  updateWorkspace,
  deleteWorkspace,

  // Members
  fetchWorkspaceMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  leaveWorkspace,

  // Share Links
  listShareLinks,
  createShareLink,
  updateShareLink,
  deleteShareLink,
  joinWorkspaceByLink,

  // Invitations
  acceptInvite,
  revokeInvite,

  // Ownership & Permissions
  transferOwnership,

  // Boards
  fetchBoardsInWorkspace,

  // Activity Log
  fetchActivities,

  // Data Export
  exportWorkspaceData,
  getExportStatus,

  // Helpers
  isWorkspaceAdmin,
  isWorkspaceOwner,
  canCreateBoard,
  getUserRole,
  canManageMembers,
  canEditWorkspace,
  canChangePolicies,

  // Deprecated
  createWorkspaceShareLink,
};

export default workspaceApi;