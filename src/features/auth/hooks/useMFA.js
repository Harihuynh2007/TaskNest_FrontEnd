import { useState, useCallback } from 'react';
import * as authApi from '../../../api/authApi';

export function useMFA() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkMFAStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApi.getMFAStatus();
      setMfaEnabled(res.enabled);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const disableMFA = useCallback(async (password) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.disableMFA(password);
      setMfaEnabled(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mfaEnabled,
    loading,
    error,
    checkMFAStatus,
    disableMFA,
  };
}
