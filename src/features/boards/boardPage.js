// src/features/boards/BoardsPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import { WorkspaceContext } from '../../contexts';
import * as boardApi from '../../api/boardApi';

import CreateBoardModal from './CreateBoardModal';

export default function BoardsPage() {
  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId } =
    useContext(WorkspaceContext);
  const [boards, setBoards]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!currentWorkspaceId) return;
    setLoading(true);
    boardApi.fetchBoards(currentWorkspaceId)
      .then(res => setBoards(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentWorkspaceId]);

  return (
    <div>
      <h1>Boards</h1>
      <select
        value={currentWorkspaceId || ''}
        onChange={e => setCurrentWorkspaceId(+e.target.value)}
      >
        {workspaces.map(ws => (
          <option key={ws.id} value={ws.id}>{ws.name}</option>
        ))}
      </select>
      <button onClick={() => setShowModal(true)}>New Board</button>

      {loading
        ? <p>Loading…</p>
        : <boardList boards={boards} />
      }

      {showModal && (
        <CreateBoardModal
          workspaceId={currentWorkspaceId}
          onCreate={b => {
            setBoards([b, ...boards]);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
