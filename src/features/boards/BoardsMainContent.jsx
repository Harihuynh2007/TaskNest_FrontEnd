// BoardsMainContent.jsx - FIXED VERSION
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';
import { fetchBoards } from '../../api/boardApi'; 
import { Link } from 'react-router-dom';
import * as boardApi from '../../api/boardApi'; 
import styled from 'styled-components';
import BoardThemeDrawer from './BoardThemeDrawer';
import ClosedBoardsModal from './ClosedBoardsPage';

export default function BoardsMainContent({ onCreateBoard }) {
  const { workspaces, currentWorkspaceId } = useContext(WorkspaceContext);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const currentWs = workspaces.find(w => w.id === currentWorkspaceId) || {};
  const [showClosedModal, setShowClosedModal] = useState(false);

  const SHOULD_REFETCH_AFTER_CREATE = false;
  
  const upsertById = (arr, item) => {
    const i = arr.findIndex(b => String(b.id) === String(item.id));
    if (i === -1) return [...arr, item];
    const clone = arr.slice();
    clone[i] = { ...clone[i], ...item };
    return clone;
  };

  useEffect(() => {
    const handleBoardRenamed = (e) => {
      const { boardId, name } = e.detail || {};
      if (!boardId || !name) return;
      setBoards(prev =>
        prev.map(b => (b.id === boardId ? { ...b, name } : b))
      );
    };
    window.addEventListener('board:renamed', handleBoardRenamed);
    return () => window.removeEventListener('board:renamed', handleBoardRenamed);
  }, []);

  const handleCreateBoard = async (data) => {
    console.log('📍 currentWorkspaceId =', currentWorkspaceId);
    console.log('📤 Bắt đầu tạo board:', data);

    if (!currentWorkspaceId) {
      console.warn("⚠️ currentWorkspaceId null — không thể tạo board.");
      return;
    }

    try {
      const res = await boardApi.createBoard(currentWorkspaceId, {
        name: data.title,
        visibility: data.visibility,
        background: data.background,
      });

      const newBoard = res?.data ?? res;

      if (!newBoard || !newBoard.id) {
        console.error('❌ Phản hồi tạo board không hợp lệ:', res);
        return;
      }

      console.log('✅ Board created:', newBoard);

      setBoards(prev => upsertById(prev, newBoard));
      setShowDrawer(false);

      if (SHOULD_REFETCH_AFTER_CREATE) {
        loadBoards();
      }
    } catch (err) {
      console.error('❌ Lỗi tạo board:', err);
      if (err.response) {
        console.error('🔥 Lỗi từ API:', err.response.data);
        console.error('🔥 Status code:', err.response.status);
      } else if (err.request) {
        console.error('📡 Không có phản hồi từ server:', err.request);
      } else {
        console.error('⚠️ Lỗi không xác định:', err.message);
      }
    }
  };

  const loadBoards = useCallback(async () => {
    if (!currentWorkspaceId) return;
    setLoading(true);
    try {
      const res = await fetchBoards(currentWorkspaceId);
      setBoards(res.data || res);
    } catch (e) {
      setError('Cannot load boards');
    } finally {
      setLoading(false);
    }
  }, [currentWorkspaceId]); 

  useEffect(() => {
    setBoards([]);
    loadBoards();
  }, [loadBoards]); 

  const handleBoardReopened = () => {
    loadBoards();
  };

  return (
    <MainWrapper>
      <ContentContainer>
        <HeaderSection>
          {/* LEFT: Workspace info */}
          <WorkspaceInfo>
            <SectionTitle>Your Workspaces</SectionTitle>
            <WorkspaceHeader>
              <WorkspaceAvatar>
                <strong>{currentWs.name?.charAt(0) || 'W'}</strong>
              </WorkspaceAvatar>
              <WorkspaceName>{currentWs.name || 'Hard Spirit'}</WorkspaceName>
            </WorkspaceHeader>
            
            {/* ✅ FIX: Relative container for drawer */}
            <DrawerContainer>
              <CreateCard onClick={() => setShowDrawer(true)}>
                Create new board
              </CreateCard>

              {showDrawer && (
                <BoardThemeDrawer
                  show={true}
                  onClose={() => setShowDrawer(false)}
                  onCreate={handleCreateBoard}
                />
              )}
            </DrawerContainer>
          </WorkspaceInfo>

          {/* RIGHT: Tabs */}
          <TabsSection>
            <TabButton>Boards</TabButton>
            <TabButton>Members</TabButton>
            <TabButton>Settings</TabButton>
            <UpgradeButton>Upgrade</UpgradeButton>
          </TabsSection>
        </HeaderSection>

        {/* ✅ FIX: Modal overlay - chỉ hiện khi drawer mở */}
        {showDrawer && <ModalOverlay onClick={() => setShowDrawer(false)} />}

        {/* Boards list */}
        <BoardsSection>
          {loading ? (
            <LoadingContainer>
              <Spinner animation="border" variant="success" />
              <span className="ml-2">Loading boards...</span>
            </LoadingContainer>
          ) : error ? (
            <ErrorContainer>{error}</ErrorContainer>
          ) : (
            <BoardGrid>
              <CreateCard onClick={() => setShowDrawer(true)}>
                Create new board
              </CreateCard>

              {boards.map(board => (
                <Link
                  key={board.id}
                  to={`/workspaces/${currentWorkspaceId}/boards/${board.id}/inbox`}
                  style={{ textDecoration: 'none' }}
                >
                  <BoardCard style={{ background: board.background || '#f4f5f7' }}>
                    {board.name}
                  </BoardCard>
                </Link>
              ))}
            </BoardGrid>
          )}
        </BoardsSection>
      </ContentContainer>
    </MainWrapper>
  );
}

// ============================================
// STYLED COMPONENTS - FIXED VERSION
// ============================================

const MainWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: var(--surface-1, #1a1f2b);
`;

const ContentContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 32px;
  gap: 24px;
  
  @media (max-width: 968px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const WorkspaceInfo = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h6`
  text-transform: uppercase;
  color: var(--text-secondary, #8a93a2);
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
`;

const WorkspaceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const WorkspaceAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--brand-primary, #58aff6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
`;

const WorkspaceName = styled.span`
  font-weight: 800;
  font-size: 18px;
  color: var(--text-primary, #e1e3e6);
`;

/* ✅ FIX: DrawerContainer - relative positioning cho drawer */
const DrawerContainer = styled.div`
  position: relative;
  display: inline-block;
`;

/* ✅ FIX: ModalOverlay - backdrop cho drawer */
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  backdrop-filter: blur(2px);
`;

const TabsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const TabButton = styled(Button).attrs({ variant: 'light' })`
  background: var(--surface-2, #222834);
  border: 1px solid var(--panel-border, #3a414f);
  color: var(--text-secondary, #8a93a2);
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: var(--surface-3, #2c3341);
    color: var(--text-primary, #e1e3e6);
    transform: translateY(-1px);
  }
`;

const UpgradeButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const BoardsSection = styled.div`
  margin-top: 24px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--text-secondary, #8a93a2);
`;

const ErrorContainer = styled.div`
  text-align: center;
  color: #e76a24;
  padding: 40px;
  font-weight: 500;
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
`;

const CreateCard = styled.div`
  width: 100%;
  height: 120px;
  border: 2px dashed var(--brand-primary, #58aff6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2, #222834);
  color: var(--text-secondary, #8a93a2);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--surface-3, #2c3341);
    color: var(--text-primary, #e1e3e6);
    border-color: #7ec3ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(88, 175, 246, 0.2);
  }
`;

const BoardCard = styled.div`
  background: var(--surface-2, #222834);
  border-radius: 8px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--text-primary, #e1e3e6);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  text-align: center;
  
  /* Gradient overlay for better text readability */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    
    &::before {
      opacity: 1;
    }
  }
  
  /* Text layer */
  & > * {
    position: relative;
    z-index: 1;
  }
`;