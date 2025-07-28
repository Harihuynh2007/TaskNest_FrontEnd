// src/contexts/WorkspaceContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import * as workspaceApi from '../api/workspaceApi';

export const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [searchNav, setSearchNav] = useState('');
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  const refreshWorkspaces = async () => {
    try {
      const res = await workspaceApi.fetchWorkspaces();
      setWorkspaces(res.data || []);
      if (res.data.length > 0) {
        setCurrentWorkspaceId(res.data[0].id);
        console.log('✅ Auto-set workspaceId =', res.data[0].id);
      } else {
        console.warn('⚠️ No workspaces found');
      }
    } catch (err) {
      console.error('❌ Failed to fetch workspaces:', err);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshWorkspaces(); // chỉ gọi nếu đã login
    } else {
      setLoadingWorkspaces(false);
    }
  }, []);


  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspaceId,
        setCurrentWorkspaceId,
        searchNav,
        setSearchNav,
        loadingWorkspaces,
        refreshWorkspaces, // 👈 để gọi lại sau khi tạo workspace
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
