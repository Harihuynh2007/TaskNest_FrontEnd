import { useState, useEffect, useCallback } from 'react';
import * as authApi from '../../../api/authApi';

export function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.getActiveSessions();
      setSessions(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revoke = useCallback(async (sessionId) => {
    try {
      await authApi.revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const revokeAll = useCallback(async () => {
    try {
      await authApi.revokeAllSessions();
      await fetchSessions();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    revoke,
    revokeAll,
    refresh: fetchSessions,
  };
}