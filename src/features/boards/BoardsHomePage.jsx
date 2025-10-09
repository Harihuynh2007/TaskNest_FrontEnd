// src/features/boards/BoardsHomePage.jsx
import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Spinner } from 'react-bootstrap';
import { Plus, ChevronDown } from 'lucide-react';

import { WorkspaceContext } from '../../contexts/WorkspaceContext';
import { useRecentBoards } from '../../hooks/useRecentBoards';
import * as boardApi from '../../api/boardApi';

import RecentBoardsSection from './RecentBoardsSection';
import ClosedBoardsModal from './ClosedBoardsPage';
import BoardThemeDrawer from './BoardThemeDrawer';

export default function BoardsHomePage() {
  const { workspaces, loadingWorkspaces } = useContext(WorkspaceContext);
  const { recentBoards, addToRecent } = useRecentBoards(false); // All workspaces
  
  const [boardsByWs, setBoardsByWs] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [drawerForWs, setDrawerForWs] = useState(null);
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [collapsedWorkspaces, setCollapsedWorkspaces] = useState(new Set());

  // 🚀 Tối ưu: Cache API calls
  const boardsCache = useMemo(() => new Map(), []);

  const loadBoardsFor = useCallback(async (wsId) => {
    // Check cache first
    if (boardsCache.has(wsId)) {
      setBoardsByWs(prev => ({ ...prev, [wsId]: boardsCache.get(wsId) }));
      return;
    }

    setLoadingMap(m => ({ ...m, [wsId]: true }));
    setErrorMap(m => ({ ...m, [wsId]: null }));
    
    try {
      const res = await boardApi.fetchBoards(wsId);
      const list = res.data || res || [];
      
      // Update cache
      boardsCache.set(wsId, list);
      setBoardsByWs(s => ({ ...s, [wsId]: list }));
    } catch (e) {
      console.error(`Failed to load boards for workspace ${wsId}:`, e);
      setErrorMap(m => ({ ...m, [wsId]: 'Cannot load boards' }));
    } finally {
      setLoadingMap(m => ({ ...m, [wsId]: false }));
    }
  }, [boardsCache]);

  useEffect(() => {
    if (!workspaces?.length) return;
    workspaces.forEach(ws => loadBoardsFor(ws.id));
  }, [workspaces, loadBoardsFor]);

  const upsert = (arr, item) => {
    const i = arr.findIndex(b => String(b.id) === String(item.id));
    if (i === -1) return [...arr, item];
    const clone = arr.slice();
    clone[i] = { ...clone[i], ...item };
    return clone;
  };

  const handleCreateBoard = async (wsId, { title, visibility, background }) => {
    if (!wsId || !title?.trim()) return;
    
    try {
      const res = await boardApi.createBoard(wsId, {
        name: title.trim(),
        visibility,
        background
      });
      
      const newBoard = res?.data ?? res;
      if (!newBoard?.id) return;

      // Update cache
      const cachedBoards = boardsCache.get(wsId) || [];
      boardsCache.set(wsId, [...cachedBoards, newBoard]);
      
      setBoardsByWs(prev => ({
        ...prev,
        [wsId]: upsert(prev[wsId] || [], newBoard)
      }));
      
      setDrawerForWs(null);
    } catch (err) {
      console.error('Create board failed:', err);
    }
  };

  const handleBoardReopened = (board) => {
    const wsId = board?.workspace?.id;
    if (!wsId) return;
    
    // Update cache
    const cachedBoards = boardsCache.get(wsId) || [];
    boardsCache.set(wsId, upsert(cachedBoards, board));
    
    setBoardsByWs(prev => ({
      ...prev,
      [wsId]: upsert(prev[wsId] || [], board)
    }));
  };

  const toggleWorkspaceCollapse = (wsId) => {
    setCollapsedWorkspaces(prev => {
      const next = new Set(prev);
      if (next.has(wsId)) {
        next.delete(wsId);
      } else {
        next.add(wsId);
      }
      return next;
    });
  };

  if (loadingWorkspaces) {
    return (
      <PageContainer>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* ✨ Recently Viewed Section */}
      <RecentBoardsSection 
        recentBoards={recentBoards} 
        loading={false}
      />

      {/* Workspace Sections */}
      {workspaces?.map(ws => {
        const boards = boardsByWs[ws.id] || [];
        const loading = !!loadingMap[ws.id];
        const error = errorMap[ws.id];
        const isCollapsed = collapsedWorkspaces.has(ws.id);

        return (
          <WorkspaceSection key={ws.id}>
            {/* Workspace Header */}
            <WsHeader>
              <WsLeft>
                <CollapseButton onClick={() => toggleWorkspaceCollapse(ws.id)}>
                  <ChevronDown 
                    size={18} 
                    style={{ 
                      transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }} 
                  />
                </CollapseButton>
                <WsLogo>{(ws.name || 'W').charAt(0).toUpperCase()}</WsLogo>
                <WsName>{ws.name || 'Workspace'}</WsName>
              </WsLeft>
              
              <WsRight>
                <WsTab to={`/workspaces/${ws.id}/boards`}>Boards</WsTab>
                <WsTab to={`/workspaces/${ws.id}/members`}>Members</WsTab>
                <WsTab to={`/workspaces/${ws.id}/settings`}>Settings</WsTab>
                <UpgradeButton>
                  ✨ Upgrade
                </UpgradeButton>
              </WsRight>
            </WsHeader>

            {/* Boards Grid - Collapsible */}
            {!isCollapsed && (
              <>
                {loading ? (
                  <LoadingContainer>
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Loading boards…</span>
                  </LoadingContainer>
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : (
                  <BoardGrid>
                    {/* Create Board Card */}
                    <CreateCard onClick={() => setDrawerForWs(ws.id)}>
                      <Plus size={24} strokeWidth={2.5} />
                      <span>Create new board</span>
                    </CreateCard>

                    {/* Board Cards */}
                    {boards.map(board => (
                      <Link
                        key={board.id}
                        to={`/workspaces/${ws.id}/boards/${board.id}/inbox`}
                        style={{ textDecoration: 'none' }}
                        onClick={() => addToRecent(board)}
                      >
                        <BoardCard $background={board.background}>
                          <BoardTitle>{board.name}</BoardTitle>
                        </BoardCard>
                      </Link>
                    ))}
                  </BoardGrid>
                )}

                {/* Drawer for this workspace */}
                {drawerForWs === ws.id && (
                  <DrawerContainer>
                    <BoardThemeDrawer
                      show={true}
                      onClose={() => setDrawerForWs(null)}
                      onCreate={(data) => handleCreateBoard(ws.id, data)}
                    />
                  </DrawerContainer>
                )}
              </>
            )}
          </WorkspaceSection>
        );
      })}

      {/* View Closed Boards Button */}
      <ClosedBoardsButton onClick={() => setShowClosedModal(true)}>
        🗃️ View all closed boards
      </ClosedBoardsButton>

      {/* Closed Boards Modal */}
      <ClosedBoardsModal
        show={showClosedModal}
        onClose={() => setShowClosedModal(false)}
        onBoardReopened={handleBoardReopened}
      />
    </PageContainer>
  );
}

// 💎 Styled Components
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const WorkspaceSection = styled.div`
  margin-bottom: 48px;
`;

const WsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #091e4208;
`;

const WsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #626f86;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #091e4214;
    color: #172b4d;
  }
`;

const WsLogo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0c66e4 0%, #0055cc 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const WsName = styled.span`
  font-weight: 700;
  font-size: 18px;
  color: #172b4d;
`;

const WsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WsTab = styled(Link)`
  padding: 6px 12px;
  border-radius: 6px;
  background: transparent;
  color: #44546f;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #091e4214;
    color: #172b4d;
  }
`;

const UpgradeButton = styled(Button).attrs({ variant: 'light' })`
  background: linear-gradient(135deg, #f5f0ff 0%, #ede9fe 100%);
  border: 1px solid #c4b5fd;
  color: #6b46c1;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  
  &:hover {
    background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
    border-color: #a78bfa;
    color: #5b21b6;
  }
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
`;

const CreateCard = styled.div`
  height: 96px;
  border-radius: 8px;
  border: 2px dashed #bfdbf7;
  background: #f7f8f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #626f86;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ebecf0;
    border-color: #0c66e4;
    color: #0c66e4;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const BoardCard = styled.div`
  height: 96px;
  border-radius: 8px;
  background: ${props => props.$background || '#f1f2f4'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    
    &::before {
      opacity: 1;
    }
  }
`;

const BoardTitle = styled.span`
  position: relative;
  z-index: 1;
  color: #172b4d;
  font-weight: 700;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  padding: 4px 8px;
  border-radius: 4px;
  line-height: 1.3;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 24px;
  color: #626f86;
`;

const ErrorMessage = styled.div`
  padding: 24px;
  color: #c9372c;
  background: #ffebe6;
  border-radius: 8px;
  font-weight: 500;
`;

const DrawerContainer = styled.div`
  position: relative;
  z-index: 1000;
  margin-top: 12px;
`;

const ClosedBoardsButton = styled(Button).attrs({ variant: 'light' })`
  margin-top: 24px;
  border-radius: 6px;
  font-weight: 600;
  padding: 8px 16px;
  border: 1px solid #dfe1e6;
  
  &:hover {
    background: #f1f2f4;
    border-color: #c1c7d0;
  }
`;