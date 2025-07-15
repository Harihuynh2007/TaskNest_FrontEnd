// ✅ WorkspaceContext.jsx – Giống Trello: chỉ fetch workspace, KHÔNG tạo ở frontend nữa
import React, { createContext, useState, useEffect } from 'react';
import * as workspaceApi from '../api/workspaceApi';

export const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [searchNav, setSearchNav] = useState('');

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const res = await workspaceApi.fetchWorkspaces();
        const list = res.data;
        console.log('📦 Workspaces fetched:', list);

        if (list.length > 0) {
          setWorkspaces(list);
          setCurrentWorkspaceId(list[0].id);
          console.log('✅ currentWorkspaceId =', list[0].id);
        } else {
          console.error('❌ Không tìm thấy workspace nào, mặc dù backend đã tạo mặc định.');
        }
      } catch (err) {
        console.error('❌ Lỗi khi load workspace:', err);
      } finally {
        setLoadingWorkspaces(false);
      }
    };

    loadWorkspaces();
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
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}