import React, { useContext, useState, useEffect,useCallback } from 'react';
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
      console.warn("⚠️ currentWorkspaceId null – không thể tạo board.");
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

      // (Tuỳ chọn) Điều hướng thẳng vào board mới tạo
      // navigate(`/workspaces/${currentWorkspaceId}/boards/${newBoard.id}/inbox`);
    } catch (err) {
      console.error('❌ Lỗi tạo board:', err);
      if (err.response) {
        console.error('📥 Lỗi từ API:', err.response.data);
        console.error('📥 Status code:', err.response.status);
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
    // Cách đơn giản nhất: Tải lại toàn bộ danh sách boards
    loadBoards();
  };

  return (
    <div className="p-4" style={{ width: '100%' }}>
      <div className="d-flex justify-content-between align-items-start">
        {/* LEFT: Workspace info */}
        <div>
          <h6 className="text-uppercase text-muted mb-3" style={{ fontWeight: 800 }}>Your Workspaces</h6>
          <div className="d-flex align-items-center mb-3">
            <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center" style={{ width: 32, height: 32 }}>
              <strong>{currentWs.name?.charAt(0) || 'W'}</strong>
            </div>
            <span className="ml-2 px-2 font-weight-bold" style={{ fontWeight: 800 }}>{currentWs.name || 'Hard Spirit'}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <CreateCard onClick={() => setShowDrawer(true)}>Create new board</CreateCard>

            {showDrawer && (
              <BoardThemeDrawer
                show={true}
                onClose={() => setShowDrawer(false)}
                onCreate={handleCreateBoard}
              />
            )}
          </div>
        </div>

        {/* RIGHT: Tabs */}
        <div className="d-flex align-items-start gap-2">
          <TabButton style={{ fontWeight: 800 }}>Boards</TabButton>
          <TabButton style={{ fontWeight: 800 }}>Members</TabButton>
          <TabButton style={{ fontWeight: 800 }}>Settings</TabButton>
          <Button variant="outline-primary" style={{ background: '#f5f0ff', borderColor: '#c4b5fd', color: '#6b46c1' }}>Upgrade</Button>
        </div>
      </div>

      {showDrawer && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} />}

      {/* Boards list */}
      <div className="mt-4">
        {loading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" variant="success" />
            <span className="ml-2">Loading boards...</span>
          </div>
        ) : error ? (
          <div className="text-danger text-center">{error}</div>
        ) : (
          <BoardGrid>
            <CreateCard onClick={() => setShowDrawer(true)}>Create new board</CreateCard>

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
      </div>

    </div>
  );
}

const CreateCard = styled.div`
  width: 180px; height: 100px; border: 2px dashed var(--brand-primary, #58aff6);
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  background: var(--surface-2, #222834); color: var(--text-secondary, #8a93a2);
  font-weight: 500; cursor: pointer; transition: 0.2s;
  &:hover {
    background: var(--surface-3, #2c3341);
    color: var(--text-primary, #e1e3e6);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,.24);
  }
`;


const TabButton = styled(Button).attrs({ variant: 'light' })`
  background: var(--surface-2, #222834);
  border: 1px solid var(--panel-border, #3a414f);
  color: var(--text-secondary, #8a93a2);
  font-weight: 500; padding: 6px 12px;
  &:hover { background: var(--surface-3, #2c3341); color: var(--text-primary, #e1e3e6); }
`;


const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const BoardCard = styled.div`
  background: var(--surface-2, #222834);
  border-radius: 6px; height: 100px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-primary, #e1e3e6);
  font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  position: relative; overflow: hidden;
  &:hover {
    background: var(--surface-3, #2c3341);
    box-shadow: 0 8px 16px rgba(0,0,0,.24);
    transform: translateY(-2px);
  }
`;
