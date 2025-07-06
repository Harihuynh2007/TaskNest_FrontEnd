import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import * as boardApi from '../../api/boardApi';
import styled from 'styled-components';

export default function CreateBoardModal({ workspaceId, onCreate, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await boardApi.createBoard(workspaceId, { name, description });
      onCreate(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>New Board</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <SquareButton variant="outline-success" onClick={onClose}>
            Cancel
          </SquareButton>
          <SquareButton type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </SquareButton>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

// Styled component cho nút vuông
const SquareButton = styled(Button)`
  background-color: ${props => (props.variant === 'outline-success' ? 'transparent' : '#28A745')};
  border-color: #28A745;
  color: ${props => (props.variant === 'outline-success' ? '#28A745' : 'white')};
  height: 32px;
  padding: 0 12px;
  border-radius: 4px;
  &:hover:not(:disabled) {
    background-color: ${props => (props.variant === 'outline-success' ? '#e0f3e0' : '#218838')};
    border-color: ${props => (props.variant === 'outline-success' ? '#28A745' : '#218838')};
    color: ${props => (props.variant === 'outline-success' ? '#28A745' : 'white')};
  }
  &:disabled {
    background-color: #1e7e34;
    border-color: #1e7e34;
    opacity: 0.65;
    color: white;
  }
`;