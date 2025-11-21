import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as workspaceApi from '../api/workspaceApi';
import { AuthContext } from './AuthContext';

export const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const { user, loading: authLoading } = useContext(AuthContext);

  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [searchNav, setSearchNav] = useState('');
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Không block refresh bằng loadingWorkspaces nữa
  const refreshWorkspaces = useCallback(async () => {
    if (!user) return;

    setLoadingWorkspaces(true);
    try {
      const res = await workspaceApi.fetchWorkspaces();
      const data = res.data || [];
      setWorkspaces(data);

      if (data.length > 0) {
        setCurrentWorkspaceId(data[0].id);
        console.log('Auto-set workspaceId =', data[0].id);
      } else {
        setCurrentWorkspaceId(null);
      }
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
    } finally {
      setLoadingWorkspaces(false);
    }
  }, [user]);

  useEffect(() => {
    // CHẶN load workspace khi AuthContext chưa xong
    if (authLoading) return;

    if (user) {
      refreshWorkspaces();
    } else {
      // cleanup khi logout
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
      setLoadingWorkspaces(false);
    }
  }, [user, authLoading, refreshWorkspaces]);

  const createWorkspace = useCallback(async (data) => {
    try {
      const res = await workspaceApi.createWorkspace(data);
      await refreshWorkspaces();
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Create workspace failed:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to create workspace',
      };
    }
  }, [refreshWorkspaces]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspaceId,
        setCurrentWorkspaceId,
        searchNav,
        setSearchNav,
        loadingWorkspaces,
        refreshWorkspaces,
        createWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
