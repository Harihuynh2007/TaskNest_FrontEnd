import { useState, useEffect, useCallback } from 'react';
import { 
  fetchWorkspaceMembers, 
  inviteMember, 
  updateMemberRole, 
  removeMember 
} from '../../../api/workspaceApi';

/**
 * Hook to manage workspace members
 * @param {number} workspaceId - Workspace ID
 * @returns {object} - { members, loading, error, refetch, invite, updateRole, remove }
 */
export function useWorkspaceMembers(workspaceId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async (params = {}) => {
    if (!workspaceId) {
      setLoading(false);
      setError(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWorkspaceMembers(workspaceId, params);
      const data = response?.data || response;
      setMembers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load members');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const invite = useCallback(async (email, role = 'member') => {
    try {
      const response = await inviteMember(workspaceId, { email, role });
      try {
        await fetchMembers();
      } catch (refreshErr) {
        console.warn('Failed to refresh members after invite:', refreshErr);
      }
      return { success: true, data: response?.data || response };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to invite member' 
      };
    }
  }, [workspaceId, fetchMembers]);
  const updateRole = useCallback(async (memberId, newRole) => {
    try {
      const response = await updateMemberRole(workspaceId, memberId, newRole);
      await fetchMembers(); // Refresh list
      return { success: true, data: response?.data || response };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to update role' 
      };
    }
  }, [workspaceId, fetchMembers]);

  const remove = useCallback(async (memberId) => {
    try {
      await removeMember(workspaceId, memberId);
      try{
        await fetchMembers();
      } catch(refreshErr){
        console.warn('Failed to refresh members after removal:', refreshErr);
        setMembers(prev => prev.filter(m => m.id !== memberId));
      }
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to remove member' 
      };
    }
  }, [workspaceId, fetchMembers]);
  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
    invite,
    updateRole,
    remove,
  };
}