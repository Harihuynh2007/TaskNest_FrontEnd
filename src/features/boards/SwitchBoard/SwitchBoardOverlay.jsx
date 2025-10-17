import { useState, useEffect, useRef, useCallback, useContext, useCache } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import FocusLock from 'react-focus-lock';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { WorkspaceContext } from '../../../contexts/WorkspaceContext.jsx';
import * as workspaceApi from '../../../api/workspaceApi';

export default function SwitchBoardOverlay({ isOpen, onClose }) {
    const { boardId } = useParams();

    const boardCache = useRef({});

    const { workspaces, currentWorkspaceId, setCurrentWorkspaceId } = useContext(WorkspaceContext);

    const [boards, setBoards] = useState([]);
    const [loadingBoards, setLoadingBoards] = useState(false);
    const [search, setSearch] = useState('');

    const overlayRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const [isTransitioning, setIsTransitioning] = useState(false);

  // ------------------ Fetch Boards ------------------
    const fetchBoards = useCallback(async (workspaceId) => {
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
        setBoards(res.data || []);
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

    // ------------------ Keyboard & Close ------------------
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    const handleBackdropClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    // ------------------ Filter ------------------
    const filteredBoards = boards.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    // ------------------ Navigate ------------------
    const handleBoardClick = async (board) => {
        console.log('Clicked board:', board);

        if (!board) return;

        if (board.id === Number(boardId)) {
            onClose();
            return;
        }

        setIsTransitioning(true);
        onClose();

        await new Promise((r) => setTimeout(r, 150));
        
        navigate(`/workspaces/${board.workspace?.id || currentWorkspaceId}/boards/${board.id}`);
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
              {/* Header */}
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
                <button className="close-btn" onClick={onClose}>
                  <FaTimes />
                </button>
              </Header>

              {/* Tabs */}
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

              {/* Grid */}
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
            </Panel>
          </FocusLock>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Styled Components ---------------- */
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

const LoadingText = styled.div`
  text-align: center;
  color: #8a93a2;
  font-size: 14px;
  padding: 16px;
`;

const EmptyText = styled(LoadingText)`
  color: #6b7280;
`;

