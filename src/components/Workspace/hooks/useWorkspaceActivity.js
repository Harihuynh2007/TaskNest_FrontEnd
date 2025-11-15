import { useState, useEffect, useCallback } from 'react';
import { fetchActivities } from '../../../api/workspaceApi';

/**
 * Hook to fetch workspace activity log
 * @param {number} workspaceId - Workspace ID
 * @param {object} initialParams - Initial query parameters
 * @returns {object} - { activities, loading, error, hasMore, loadMore, refetch }
 */
export function useWorkspaceActivity(workspaceId, initialParams = {}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);

  const fetchActivityLog = useCallback(async (params = {}, append = false) => {
    if (!workspaceId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetchActivities(workspaceId, params);
      const data = response?.data || response;
      
      if (append) {
        setActivities(prev => [...prev, ...(data.results || [])]);
      } else {
        setActivities(data.results || []);
      }
      
      setHasMore(!!data.next);
      setNextPage(data.next);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load activity log');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchActivityLog(initialParams);
  }, [fetchActivityLog, initialParams]);
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const params = { ...initialParams };
    if (nextPage) {
      // Extract page number from next URL if backend uses pagination
      const url = new URL(nextPage, window.location.origin);
      const page = url.searchParams.get('page');
      if (page) params.page = page;
    }
    
    await fetchActivityLog(params, true);
  }, [hasMore, loading, nextPage, initialParams, fetchActivityLog]);

  return {
    activities,
    loading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchActivityLog(initialParams),
  };
}