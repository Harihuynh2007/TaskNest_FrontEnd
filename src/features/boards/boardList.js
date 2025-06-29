// src/features/boards/BoardList.jsx
import React from 'react';
import boardCard from './boardCard';

export default function BoardList({ boards }) {
  return (
    <div className="board-list">
      {boards.map(b => <boardCard key={b.id} board={b} />)}
    </div>
  );
}
