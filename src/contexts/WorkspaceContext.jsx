// src/contexts/WorkspaceContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import * as workspaceApi from '../api/workspaceApi';

export const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces]           = useState([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [searchNav , setSearchNav] = useState('');

  useEffect(() => {
    workspaceApi.fetchWorkspaces()
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
