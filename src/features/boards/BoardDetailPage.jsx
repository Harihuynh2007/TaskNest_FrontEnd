import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

export default function BoardDetailPage() {
  const { workspaceId, boardId } = useParams();
  const [cards, setCards] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(true);

  useEffect(() => {
    console.log('🟢 BoardDetailPage mounted for:', workspaceId, boardId);
    // You can fetch board details here in future
  }, [workspaceId, boardId]);

  const handleAddCard = () => {
    if (inputValue.trim() === '') return;
    setCards([...cards, inputValue]);
    setInputValue('');
  };

  return (
    <BoardWrapper>
      <Header>
        <h4>📥 Inbox for board {boardId}</h4>
      </Header>

      {showInput && (
        <CardInputWrapper>
          <Input
            placeholder="Enter a title"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <ButtonRow>
            <AddButton onClick={handleAddCard}>Add card</AddButton>
            <CancelButton onClick={() => setShowInput(false)}>Cancel</CancelButton>
          </ButtonRow>
        </CardInputWrapper>
      )}

      <Promo>
        <h5>Consolidate your to-dos</h5>
        <p>Email it, say it, forward it—however it comes, get it into Trello fast.</p>
        <IconGrid>
          <CircleIcon>📧</CircleIcon>
          <CircleIcon>📱</CircleIcon>
          <CircleIcon>💬</CircleIcon>
          <CircleIcon>👥</CircleIcon>
        </IconGrid>
        <div className="mt-3 text-muted">🔒 Inbox is only visible to you</div>
      </Promo>

      <FooterBar>
        <TabIcon selected>📥</TabIcon>
        <TabIcon>🗓️</TabIcon>
        <TabIcon>🧱</TabIcon>
        <TabIcon>🧱</TabIcon>
      </FooterBar>
    </BoardWrapper>
  );
}

export const BoardWrapper = styled.div`
  min-height: 100vh;
  background: #e7effa;
  padding: 24px;
`;

export const Header = styled.div`
  margin-bottom: 16px;
`;

export const CardInputWrapper = styled.div`
  background: white;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  max-width: 480px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const ButtonRow = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 8px;
`;

export const AddButton = styled.button`
  background: #0c66e4;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
`;

export const CancelButton = styled.button`
  background: none;
  border: none;
  color: #5e6c84;
  font-weight: 500;
`;

export const Promo = styled.div`
  text-align: center;
  margin-top: 80px;
  color: #344563;
`;

export const IconGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
`;

export const CircleIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

export const FooterBar = styled.div`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
`;

export const TabIcon = styled.div`
  font-size: 20px;
  opacity: ${(props) => (props.selected ? 1 : 0.4)};
`;