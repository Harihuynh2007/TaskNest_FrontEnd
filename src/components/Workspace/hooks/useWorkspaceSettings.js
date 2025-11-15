import { useState, useEffect, useCallback } from 'react';
import { 
  fetchWorkspaceDetails, 
  updateWorkspace, 
  deleteWorkspace,
  transferOwnership,
  leaveWorkspace 
} from '../../../api/workspaceApi';

/**
 * Hook to manage workspace settings
 * @param {number} workspaceId - Workspace ID
 * @returns {object} - { workspace, loading, error, update, delete, transfer, leave, refetch }
 */
export function useWorkspaceSettings(workspaceId) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkspace = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWorkspaceDetails(workspaceId);
      const data = response?.data || response;
      setWorkspace(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load workspace');
      console.error('Error fetching workspace:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);
  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const update = useCallback(async (updates) => {
    try {
      const response = await updateWorkspace(workspaceId, updates);
      const data = response?.data || response;
      setWorkspace(data);
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to update workspace' 
      };
    }
  }, [workspaceId]);

  const deleteWs = useCallback(async () => {
    try {
      await deleteWorkspace(workspaceId);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to delete workspace' 
      };
    }
  }, [workspaceId]);

  const transfer = useCallback(async (newOwnerId) => {
    try {
      const response = await transferOwnership(workspaceId, newOwnerId);
      await fetchWorkspace(); // Refresh workspace data
      return { success: true, data: response?.data || response };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to transfer ownership' 
      };
    }
  }, [workspaceId, fetchWorkspace]);

  const leave = useCallback(async () => {
    try {
      await leaveWorkspace(workspaceId);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to leave workspace' 
      };
    }
  }, [workspaceId]);

  return {
    workspace,
    loading,
    error,
    update,
    delete: deleteWs,
    transfer,
    leave,
    refetch: fetchWorkspace,
  };
}