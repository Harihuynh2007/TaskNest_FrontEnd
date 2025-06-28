// src/components/boards/CreateBoardModal.js
import React, { useState, useContext } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { createBoard } from '../../services/boardsService';
import { WorkspaceContext } from '../../context/WorkspaceContext';


export default function CreateBoardModal({ show, onHide, onCreated }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const { currentWorkspaceId } = useContext(WorkspaceContext);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      await createBoard(currentWorkspaceId, { name });
      onCreated();
      setName('');
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Failed to create board');
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Create Board</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group controlId="boardName">
            <Form.Label>Board Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit">Create</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
