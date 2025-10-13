import api from './apiClient';
import { workspaces as routes } from './apiRoutes';

/** Get all workspaces the current user can access. */
export const fetchWorkspaces = () => api.get(routes.list());

/** Create a workspace.
 * @param {object} data - { name: string }
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

/** List members in a workspace.
 * @param {string|number} workspaceId
 * @returns {Promise<Array>}
 */
export const fetchWorkspaceMembers = (workspaceId) =>
  api.get(routes.members(workspaceId));

/** Invite a member by email.
 * @param {string|number} workspaceId
 * @param {object} data - { email: string, role?: 'admin'|'member' }
 * @returns {Promise<object>}
 */
export const inviteMember = (workspaceId, data) =>
  api.post(routes.inviteMember(workspaceId), data);

/** List boards in a workspace that the user can see.
 * Server applies visibility/role/membership filters.
 * @param {string|number} workspaceId
 * @returns {Promise<Array>}
 */
export const fetchBoardsInWorkspace = (workspaceId) =>
  api.get(routes.boards(workspaceId));

/** Share links */
export const listShareLinks = (workspaceId) =>
  api.get(routes.shareLinks(workspaceId));

/** Create a share link.
 * @param {string|number} workspaceId
 * @param {object} payload - { role: 'admin'|'member', expires_at?, max_uses?, domain_restriction? }
 * @returns {Promise<object>}
 */
export const createShareLink = (workspaceId, payload) =>
  api.post(routes.shareLinks(workspaceId), payload);

/** Update a share link.
 * @param {string} token
 * @param {object} patch - { enabled?, expires_at?, max_uses?, domain_restriction?, role? }
 * @returns {Promise<object>}
 */
export const updateShareLink = (token, patch) =>
  api.patch(routes.shareLinkDetail(token), patch);

/** Delete a share link.
 * @param {string} token
 * @returns {Promise<void>}
 */
export const deleteShareLink = (token) =>
  api.delete(routes.shareLinkDetail(token));

/** Join a workspace via share link.
 * @param {string} token
 * @returns {Promise<object>}
 */
export const joinWorkspaceByLink = (token) =>
  api.post(routes.joinByLink(token));

/** Accept a workspace invite.
 * @param {string} token
 * @returns {Promise<object>}
 */
export const acceptInvite = (token) =>
  api.post(routes.inviteAccept(token));

/** Revoke a workspace invite.
 * @param {string} token
 * @returns {Promise<void>}
 */
export const revokeInvite = (token) =>
  api.post(routes.inviteRevoke(token));

/** Helpers */

/** Is user an admin in this workspace?
 * @param {Array} members
 * @param {number} userId
 * @returns {boolean}
 */
export const isWorkspaceAdmin = (members, userId) => {
  const membership = members.find(m => m.user?.id === userId);
  return membership?.role === 'admin';
};

/** Is user the workspace owner?
 * @param {object} workspace
 * @param {number} userId
 * @returns {boolean}
 */
export const isWorkspaceOwner = (workspace, userId) => {
  return workspace?.owner === userId || workspace?.owner?.id === userId;
};

/** Can user create a board in this workspace?
 * Current rule: owner only. (Adjust if backend changes.)
 * @param {object} workspace
 * @param {Array} members
 * @param {number} userId
 * @returns {boolean}
 */
export const canCreateBoard = (workspace, members, userId) => {
  return isWorkspaceOwner(workspace, userId);
  // To allow members too, compute membership and OR the check above.
};

export const createWorkspaceShareLink = async (workspaceId) => {
  const res = await api.post(`/workspaces/${workspaceId}/share-link/`);
  return res.data; 
};
