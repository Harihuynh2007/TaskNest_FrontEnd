import { useState, useEffect, useCallback } from 'react';
import { 
  listShareLinks, 
  createShareLink, 
  updateShareLink, 
  deleteShareLink 
} from '../../../api/workspaceApi';

/**
 * Hook to manage workspace share links
 * @param {number} workspaceId - Workspace ID
 * @returns {object} - { links, loading, error, refetch, create, update, remove }
 */
export function useShareLinks(workspaceId) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLinks = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await listShareLinks(workspaceId);
      const data = response?.data || response;
      setLinks(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load share links');
      console.error('Error fetching share links:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const create = useCallback(async (options) => {
    try {
      setLoading(true);
      const response = await createShareLink(workspaceId, options);
      try {
        await fetchLinks(); // Refresh list
      } catch (refreshErr) {
        console.error('Error refreshing links after create:', refreshErr);
        // Still return success since the create itself succeeded
      }
      return { success: true, data: response?.data || response };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to create share link' 
      };
    } finally {
      setLoading(false);
    }
  }, [workspaceId, fetchLinks]);
  const update = useCallback(async (linkId, updates) => {
    try {
      const response = await updateShareLink(workspaceId, linkId, updates);
      await fetchLinks(); // Refresh list
      return { success: true, data: response?.data || response };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to update share link' 
      };
    }
  }, [workspaceId, fetchLinks]);

  const remove = useCallback(async (linkId) => {
    try {
      await deleteShareLink(workspaceId, linkId);
      await fetchLinks(); // Consistent with create/update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to delete share link' 
      };
    }
  }, [workspaceId, fetchLinks]);
  return {
    links,
    loading,
    error,
    refetch: fetchLinks,
    create,
    update,
    remove,
  };
}