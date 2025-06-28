// src/components/boards/BoardCard.js
import React from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function BoardCard({ board }) {
  const nav = useNavigate();

  return (
    <Card 
      onClick={() => nav(`/boards/${board.id}`)}
      className="h-100 board-card"
      style={{ cursor: 'pointer' }}
    >
      {board.cover_url && 
        <Card.Img variant="top" src={board.cover_url} height={100} style={{ objectFit: 'cover' }} />
      }
      <Card.Body>
        <Card.Title className="mb-2">{board.name}</Card.Title>
        <div className="text-muted" style={{ fontSize: '0.9rem' }}>
          {board.member_count} members
        </div>
      </Card.Body>
    </Card>
  );
}
