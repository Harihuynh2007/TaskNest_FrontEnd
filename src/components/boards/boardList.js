// src/components/boards/BoardList.js
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import BoardCard from './boardCard';

export default function BoardList({ boards }) {
  return (
    <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
      {boards.map(board => (
        <Col key={board.id}>
          <BoardCard board={board} />
        </Col>
      ))}
    </Row>
  );
}
