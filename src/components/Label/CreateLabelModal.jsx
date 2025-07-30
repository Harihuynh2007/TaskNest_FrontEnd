// CreateLabelModal.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from '../../api/axiosClient';

const COLORS = [
  'green', 'yellow', 'red', 'blue', 'orange', 'purple'
];

export default function CreateLabelModal({ boardId, onClose, onLabelCreated }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await axios.post(`/boards/${boardId}/labels/`, {
        name,
        color,
      });
      onLabelCreated();
    } catch (err) {
      console.error('Failed to create label:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>Create a new label</Title>
        <Input
          placeholder="Label name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <ColorList>
          {COLORS.map((c) => (
            <ColorDot
              key={c}
              $color={c}
              $selected={color === c}
              onClick={() => setColor(c)}
            />
          ))}
        </ColorList>
        <ActionRow>
          <CreateBtn onClick={handleCreate} disabled={loading}>Create</CreateBtn>
          <CancelBtn onClick={onClose}>Cancel</CancelBtn>
        </ActionRow>
      </Modal>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
`;

const Modal = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
`;

const Title = styled.h4`
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ColorList = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const ColorDot = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: ${({ $selected }) => ($selected ? '3px solid black' : '2px solid white')};
  cursor: pointer;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CreateBtn = styled.button`
  padding: 6px 12px;
  background: #0c66e4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const CancelBtn = styled.button`
  padding: 6px 12px;
  background: #f1f2f4;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;