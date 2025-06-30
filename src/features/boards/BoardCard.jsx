import React from 'react';

export default function BoardCard({ board }) {
  return (
    <div className="board-card">
      <h3>{board.name}</h3>
      <p>{board.description}</p>
    </div>
  );
}
