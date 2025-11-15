import { useMemo } from 'react';
import { 
  isWorkspaceOwner, 
  isWorkspaceAdmin,
  canManageMembers,
  canEditWorkspace,
  canChangePolicies,
  getUserRole 
} from '../../../api/workspaceApi';

/**
 * Hook to compute workspace permissions for current user
 * @param {object} workspace - Workspace object
 * @param {Array} members - Array of workspace members
 * @param {number} userId - Current user ID
 * @returns {object} - Permission flags
 */
export function useWorkspacePermissions(workspace, members, userId) {
  return useMemo(() => {
    if (!workspace || !userId || !members) {
      return {
        isOwner: false,
        isAdmin: false,
        isMember: false,
        role: null,
        canEdit: false,
        canManage: false,
        canChangePolicy: false,
        canDelete: false,
        canLeave: false,
        canTransfer: false,
      };
    }
    const isOwner = isWorkspaceOwner(workspace, userId);
    const isAdmin = isWorkspaceAdmin(members, userId);
    const role = getUserRole(workspace, members, userId);
    const isMember = !!role;

    return {
      isOwner,
      isAdmin,
      isMember,
      role,
      canEdit: canEditWorkspace(workspace, members, userId),
      canManage: canManageMembers(workspace, members, userId),
      canChangePolicy: canChangePolicies(workspace, userId),
      canDelete: isOwner,
      canLeave: !isOwner && isMember,
      canTransfer: isOwner,
    };
  }, [workspace, members, userId]);
}

