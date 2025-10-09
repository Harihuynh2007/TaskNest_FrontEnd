// src/hooks/useRecentBoards.js
import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { WorkspaceContext } from '../contexts/WorkspaceContext';
import * as recentBoardsUtil from '../utils/recentBoards';

export function useRecentBoards(filterByWorkspace = false) {
  const { user } = useContext(AuthContext);
  const { currentWorkspaceId } = useContext(WorkspaceContext);
  const [recentBoards, setRecentBoards] = useState([]);

  // Load recent boards
  const loadRecentBoards = useCallback(() => {
    if (!user?.id) {
      setRecentBoards([]);
      return;
    }

    const boards = filterByWorkspace && currentWorkspaceId
      ? recentBoardsUtil.getRecentBoardsByWorkspace(user.id, currentWorkspaceId)
      : recentBoardsUtil.getRecentBoards(user.id);

    setRecentBoards(boards);
  }, [user?.id, currentWorkspaceId, filterByWorkspace]);

  // Load on mount and when dependencies change
  useEffect(() => {
    loadRecentBoards();
  }, [loadRecentBoards]);

  // Add board to recent
  const addToRecent = useCallback((board) => {
    if (!user?.id) return;
    recentBoardsUtil.addRecentBoard(user.id, board);
    loadRecentBoards(); // Refresh
  }, [user?.id, loadRecentBoards]);

  // Remove board from recent
  const removeFromRecent = useCallback((boardId) => {
    if (!user?.id) return;
    recentBoardsUtil.removeRecentBoard(user.id, boardId);
    loadRecentBoards(); // Refresh
  }, [user?.id, loadRecentBoards]);

  // Clear all recent boards
  const clearRecent = useCallback(() => {
    if (!user?.id) return;
    recentBoardsUtil.clearRecentBoards(user.id);
    loadRecentBoards(); // Refresh
  }, [user?.id, loadRecentBoards]);

  return {
    recentBoards,
    addToRecent,
    removeFromRecent,
    clearRecent,
    refreshRecent: loadRecentBoards
  };
}