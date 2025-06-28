// src/context/WorkspaceContext.js
import React, { createContext, useState, useEffect } from 'react';
import { fetchWorkspaces } from '../services/workspacesService'; // bạn sẽ tự tạo file này

export const WorkspaceContext = createContext({
  workspaces: [],
  currentWorkspaceId: null,
  setCurrentWorkspaceId: () => {},
});

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);

  useEffect(() => {
    // lên server lấy list workspace, rồi set mặc định workspace đầu tiên
    fetchWorkspaces()
      .then(res => {
        setWorkspaces(res.data);
        if (res.data.length) setCurrentWorkspaceId(res.data[0].id);
      })
      .catch(console.error);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, currentWorkspaceId, setCurrentWorkspaceId }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
