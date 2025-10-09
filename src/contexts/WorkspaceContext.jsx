import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as workspaceApi from '../api/workspaceApi';
import { AuthContext } from './AuthContext';

export const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const { user } = useContext(AuthContext);

  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [searchNav, setSearchNav] = useState('');
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [submitting, setSubmitting] = useState(false);


  // ✅ Wrap với useCallback để tránh re-render
  const refreshWorkspaces = useCallback(async () => {
    if (!user) return; // ✅ Guard clause
    
    setLoadingWorkspaces(true);
    try {
      const res = await workspaceApi.fetchWorkspaces();
      const data = res.data || [];
      setWorkspaces(data);
      
      if (data.length > 0) {
        setCurrentWorkspaceId(data[0].id);
        console.log('✅ Auto-set workspaceId =', data[0].id);
      } else {
        console.warn('⚠️ No workspaces found');
        setCurrentWorkspaceId(null);
      }
    } catch (err) {
      console.error('❌ Failed to fetch workspaces:', err);
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
    } finally {
      setLoadingWorkspaces(false);
    }
  }, [user]); // ✅ Dependency chính xác

  useEffect(() => {
    if (user) {
      refreshWorkspaces();
    } else {
      // Cleanup khi logout
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
      setLoadingWorkspaces(false);
    }
  }, [user, refreshWorkspaces]); // ✅ Đầy đủ dependencies

  // ✅ Helper function để tạo workspace
  const createWorkspace = useCallback(async (data) => {
    try {
      const res = await workspaceApi.createWorkspace(data);
      await refreshWorkspaces(); // ✅ Refresh sau khi tạo
      return { success: true, data: res.data };
    } catch (err) {
      console.error('❌ Create workspace failed:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to create workspace' };
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
        createWorkspace, // ✅ Export để Modal dùng
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}