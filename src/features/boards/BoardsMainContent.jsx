import React, { useContext, useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';
import { fetchBoards } from '../../api/boardApi'; 
import { useNavigate } from 'react-router-dom';

import * as boardApi from '../../api/boardApi'; 
import styled from 'styled-components';
import BoardThemeDrawer from './BoardThemeDrawer';
import { createWorkspace } from '../../api/workspaceApi';
import { Link } from 'react-router-dom';

export default function BoardsMainContent({ onCreateBoard }) {
  const { workspaces, currentWorkspaceId } = useContext(WorkspaceContext);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const navigate = useNavigate();
  const currentWs = workspaces.find(w => w.id === currentWorkspaceId) || {};

  useEffect(() => {
    async function loadBoards() {
      if (!currentWorkspaceId) return;
      setLoading(true);
      try {
        const res = await fetchBoards(currentWorkspaceId);
        setBoards(res.data || []);
        setError(null);
      } catch {
        setError('Cannot load boards.');
      } finally {
        setLoading(false);
      }
    }
    loadBoards();
  }, [currentWorkspaceId]);

  const handleCreateBoard = async (data) => {
    console.log('📍 currentWorkspaceId =', currentWorkspaceId);
    console.log('📤 Bắt đầu tạo board:', data);

  if (!currentWorkspaceId) {
  console.warn("⚠️ currentWorkspaceId null – không thể tạo board.");
  return;
  }

 // đường dẫn tùy bạn gọi từ đâu

  try {
    const res = await boardApi.createBoard(currentWorkspaceId, {
      name: data.title,
      visibility: data.visibility,
      background: data.background,
    });
    console.log('✅ Board created:', res.data); 
    // Cập nhật state boards trực tiếp mà không gọi lại API
    setBoards(prevBoards => [...prevBoards, res.data]);
    setShowDrawer(false);
    //navigate(`/workspaces/${currentWorkspaceId}/boards/${res.data.id}/inbox`);
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

          <Button
            variant="light"
            className="mt-3"
            style={{ borderRadius: 4, fontWeight: 500 }}
          >
            View all closed boards
          </Button>
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
        ) : boards.length === 0 ? (
          <div className="text-center">No boards found.</div>
        ) : (
          <BoardGrid>
            {boards.map(board => (
              <Link
                key={board.id}
                to={`/workspaces/${currentWorkspaceId}/boards/${board.id}/inbox`}
                style={{ textDecoration: 'none' }}
              >
                <BoardCard>{board.name}</BoardCard>
              </Link>
            ))}
          </BoardGrid>
        )}
      </div>
    </div>
  );
}

const CreateCard = styled.div`
  width: 180px;
  height: 100px;
  border: 2px solid #1e7e34;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f5f7;
  color: #172b4d;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const TabButton = styled(Button).attrs({ variant: 'light' })`
  background-color: #f4f5f7;
  border: 1px solid #dcdfe4;
  color: #172b4d;
  font-weight: 500;
  padding: 6px 12px;
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const BoardCard = styled.div`
  background-color: #f4f5f7;
  border-radius: 6px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #e2e4e6;
  }
`;