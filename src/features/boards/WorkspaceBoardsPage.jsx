// src/features/boards/WorkspaceBoardsPage.jsx
import React, { useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WithHeaderAndSidebarLayout from '../../Layouts/WithHeaderAndSidebarLayout';
import BoardsMainContent from './BoardsMainContent';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';

export default function WorkspaceBoardsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { setCurrentWorkspaceId, workspaces, loadingWorkspaces } = useContext(WorkspaceContext);

  useEffect(() => {
    if (!workspaceId) {
      navigate('/boards', { replace: true });
      return;
    }

    // Sync workspace context với URL
    if (workspaceId && !loadingWorkspaces) {
      const wsExists = workspaces.some(ws => ws.id === workspaceId);
      
      if (!wsExists) {
        console.warn(`Workspace ${workspaceId} not found. Redirecting to /boards`);
        navigate('/boards', { replace: true });
        return;
      }

      setCurrentWorkspaceId(workspaceId);
    }
  }, [workspaceId, setCurrentWorkspaceId, workspaces, loadingWorkspaces, navigate]);

  return (
    <WithHeaderAndSidebarLayout>
      <BoardsMainContent />
    </WithHeaderAndSidebarLayout>
  );
}