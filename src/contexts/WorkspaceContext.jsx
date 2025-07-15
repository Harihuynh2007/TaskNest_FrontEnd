import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext'; // đường dẫn đúng
export const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const { workspaces: preloadWorkspaces, loading } = useContext(AuthContext);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [searchNav, setSearchNav] = useState('');

  useEffect(() => {
    if (!currentWorkspaceId && preloadWorkspaces.length > 0) {
      setCurrentWorkspaceId(preloadWorkspaces[0].id);
      console.log('✅ Workspace set from AuthContext:', preloadWorkspaces[0].id);
    }
  }, [preloadWorkspaces, currentWorkspaceId]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: preloadWorkspaces,
        currentWorkspaceId,
        setCurrentWorkspaceId,
        searchNav,
        setSearchNav,
        loadingWorkspaces: loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
