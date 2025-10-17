import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import FocusLock from 'react-focus-lock';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { WorkspaceContext } from '../../../contexts/WorkspaceContext';
import * as workspaceApi from '../../../api/workspaceApi';

export default function SwitchBoardOverlay({ isOpen, onClose }) {
  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId } = useContext(WorkspaceContext);
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [search, setSearch] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const overlayRef = useRef(null);
  const inputRef = useRef(null);
  const boardCache = useRef({});

  const fetchBoards = useCallback(async (workspaceId, useCache = true) => {
    if (!workspaceId) return;
    if (useCache && boardCache.current[workspaceId]) {
      setBoards(boardCache.current[workspaceId]);
      return;
    }
    setLoadingBoards(true);
    try {
      const res = await workspaceApi.fetchBoardsInWorkspace(workspaceId);
      const fetchedBoards = res.data || [];
      boardCache.current[workspaceId] = fetchedBoards;
      setBoards(fetchedBoards);
    } catch (err) {
      console.error('❌ Fetch boards failed:', err);
      setBoards([]);
    } finally {
      setLoadingBoards(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && currentWorkspaceId) {
      fetchBoards(currentWorkspaceId);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, currentWorkspaceId, fetchBoards]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleBoardClick = async (board) => {
    if (!board) return;
    if (board.id === Number(boardId)) return onClose();
    setIsTransitioning(true);
    onClose();
    await new Promise((r) => setTimeout(r, 150));
    navigate(`/workspaces/${board.workspace?.id || board.workspace_id || currentWorkspaceId}/boards/${board.id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          as={motion.div}
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={handleBackdropClick}
        >
          <FocusLock>
            <Panel
              as={motion.div}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Header>
                <div className="search-bar">
                  <FaSearch className="icon" />
                  <input
                    ref={inputRef}
                    placeholder="Search your boards..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button
                  className="view-toggle"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
                  title={viewMode === 'grid' ? 'List view' : 'Grid view'}
                >
                  {viewMode === 'grid' ? '📋' : '🔳'}
                </button>
                <button className="close-btn" onClick={onClose}>
                  <FaTimes />
                </button>
              </Header>

              <Tabs>
                {workspaces.map((ws) => (
                  <TabButton
                    key={ws.id}
                    $active={currentWorkspaceId === ws.id}
                    onClick={() => setCurrentWorkspaceId(ws.id)}
                  >
                    {ws.name}
                  </TabButton>
                ))}
              </Tabs>

              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Grid>
                      {loadingBoards ? (
                        <LoadingText>Loading boards...</LoadingText>
                      ) : filteredBoards.length === 0 ? (
                        <EmptyText>No boards found</EmptyText>
                      ) : (
                        filteredBoards.map((b) => (
                          <BoardCard
                            key={b.id}
                            $bg={b.background || b.cover_url}
                            onClick={() => handleBoardClick(b)}
                          >
                            <div className="overlay" />
                            <span>{b.name}</span>
                          </BoardCard>
                        ))
                      )}
                    </Grid>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <List>
                      {loadingBoards ? (
                        <LoadingText>Loading boards...</LoadingText>
                      ) : filteredBoards.length === 0 ? (
                        <EmptyText>No boards found</EmptyText>
                      ) : (
                        filteredBoards.map((b) => (
                          <ListItem key={b.id} onClick={() => handleBoardClick(b)}>
                            <span className="board-name">{b.name}</span>
                            {b.workspace?.name && (
                              <span className="workspace-name">{b.workspace.name}</span>
                            )}
                          </ListItem>
                        ))
                      )}
                    </List>
                  </motion.div>
                )}
              </AnimatePresence>
            </Panel>
          </FocusLock>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1002;
`;

const Panel = styled.div`
  background: rgba(34, 40, 52, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.4);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 20px;
  width: clamp(320px, 60vw, 720px);
  max-height: 80vh;
  overflow-y: auto;
  color: #e1e3e6;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .search-bar {
    flex: 1;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 8px 12px;
    gap: 8px;
    .icon { color: #8a93a2; }
    input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #e1e3e6;
      font-size: 14px;
    }
  }

  .view-toggle {
    background: transparent;
    border: none;
    font-size: 18px;
    color: #8a93a2;
    cursor: pointer;
    margin-left: 10px;
    transition: color 0.2s ease, transform 0.2s ease;
    &:hover {
      color: #3b82f6;
      transform: scale(1.1);
    }
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #8a93a2;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: 0.2s;
    &:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
  }
`;

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const TabButton = styled.button`
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
      : 'rgba(255, 255, 255, 0.05)'};
  color: ${({ $active }) => ($active ? '#fff' : '#8a93a2')};
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  &:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    color: #fff;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
`;

const BoardCard = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: ${({ $bg }) =>
    $bg ? `url(${$bg}) center/cover no-repeat` : 'linear-gradient(135deg, #3b82f6, #06b6d4)'};
  height: 110px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
  }
  span {
    position: absolute;
    bottom: 8px;
    left: 10px;
    color: #fff;
    font-weight: 600;
  }
  &:hover {
    transform: scale(1.03);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #e1e3e6;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .board-name {
    font-weight: 600;
    font-size: 14px;
  }
  .workspace-name {
    font-size: 13px;
    color: #8a93a2;
    margin-left: 8px;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: #8a93a2;
  font-size: 14px;
  padding: 16px;
`;

const EmptyText = styled(LoadingText)`
  color: #6b7280;
`;
