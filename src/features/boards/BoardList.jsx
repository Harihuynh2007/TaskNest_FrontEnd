import React from 'react';
import BoardCard from './BoardCard';

export default function BoardList({ boards }) {
  return (
    <div className="board-list">
      {boards.map(b => (
        <BoardCard key={b.id} board={b} />
      ))}
    </div>
  );
}
