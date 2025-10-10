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
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; padding-bottom: 12px;
  border-bottom: 1px solid var(--panel-border, #3a414f);
`;


const WsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CollapseButton = styled.button`
  background: none; border: none; padding: 4px; cursor: pointer; color: var(--text-secondary, #8a93a2);
  display: flex; align-items: center; border-radius: 4px; transition: all 0.2s ease;
  &:hover { background: var(--surface-3, #2c3341); color: var(--text-primary, #e1e3e6); }
`;


const WsLogo = styled.div`
  width: 40px; height: 40px; border-radius: 8px;
  background: var(--brand-gradient, linear-gradient(135deg,#58aff6 0%,#3a7bd5 100%));
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.12);
`;


const WsName = styled.span`
  font-weight: 700;
  font-size: 18px;
  color: var(--text-primary, #e1e3e6);
`;


const WsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WsTab = styled(Link)`
  padding: 6px 12px; border-radius: 6px; background: transparent;
  color: var(--text-secondary, #8a93a2);
  text-decoration: none; font-weight: 500; font-size: 14px; transition: all .2s;
  &:hover { background: var(--surface-3, #2c3341); color: var(--text-primary, #e1e3e6); }
`;


const UpgradeButton = styled(Button).attrs({ variant: 'light' })`
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid var(--panel-border, #3a414f); color: var(--text-primary, #e1e3e6);
  font-weight: 600; padding: 6px 16px; border-radius: 6px; font-size: 14px;
  &:hover { filter: brightness(1.06); box-shadow: 0 6px 16px rgba(0,0,0,.26); }
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
  height: 96px; border-radius: 8px; border: 2px dashed var(--brand-primary, #58aff6);
  background: var(--surface-2, #222834); color: var(--text-secondary, #8a93a2);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  font-weight: 600; font-size: 14px; cursor: pointer; transition: all .2s;
  &:hover { background: var(--surface-3, #2c3341); border-color: var(--brand-primary, #58aff6);
            color: var(--text-primary, #e1e3e6); transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,.26); }
`;


const BoardCard = styled.div`
  height: 96px; border-radius: 8px;
  background: ${p => p.$background || 'var(--surface-2, #222834)'};
  background-size: cover; background-position: center;
  display: flex; align-items: flex-end; padding: 8px; cursor: pointer; transition: all .2s;
  position: relative; overflow: hidden;
  &::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%);
    opacity: 0; transition: opacity .2s;
  }
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,.24);
            &::before { opacity: 1; } }
`;


const BoardTitle = styled.span`
  color: var(--text-primary, #e1e3e6); background: rgba(0,0,0,.4);
  backdrop-filter: blur(4px); padding: 4px 8px; border-radius: 4px;
  font-weight: 700; font-size: 16px; line-height: 1.3; position: relative; z-index: 1;
`;


const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 24px;
  color: #626f86;
`;

const ErrorMessage = styled.div`
  padding: 24px;
  color: #ffb4a9;
  background: rgba(201,55,44,0.12);
  border: 1px solid rgba(201,55,44,0.35);
  border-radius: 8px;
  font-weight: 600;
`;


const DrawerContainer = styled.div`
  position: relative;
  z-index: 1000;
  margin-top: 12px;
`;

const ClosedBoardsButton = styled(Button).attrs({ variant: 'light' })`
  margin-top: 24px;
  border-radius: 6px;
  font-weight: 700;
  padding: 8px 16px;
  border: 1px solid var(--panel-border, #3a414f);
  background: var(--surface-2, #222834);
  color: var(--text-primary, #e1e3e6);
  &:hover {
    background: var(--surface-3, #2c3341);
    box-shadow: 0 6px 16px rgba(0,0,0,.26);
  }
`;
