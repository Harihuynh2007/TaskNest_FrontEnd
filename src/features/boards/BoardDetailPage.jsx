import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import InboxPane from './panes/InboxPane';
import PlannerPane from './panes/PlannerPane';
import BoardPane from './panes/BoardPane';
import BottomFloatingNav from './BottomFloatingNav';
import FullCardModal from '../../components/FullCardModal';
import CardEditPopup from './CardEditPopup';
import { getBoard } from '../../api/boardApi.js';

export default function BoardDetailPage() {
  const { workspaceId, boardId } = useParams();
  const [background, setBackground] = useState('#e4f0f6');
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState(['inbox']);
  const [cards, setCards] = useState([]);
  const [archived, setArchived] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [editPopup, setEditPopup] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    async function loadBoard() {
      if (!workspaceId || !boardId) return;
      setLoading(true);
      try {
        const res = await getBoard(workspaceId, boardId);
        setBackground(res.data.background || '#e4f0f6');
      } catch (err) {
        console.error('Lỗi fetch board:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBoard();
  }, [workspaceId, boardId]);

  // Load từ localStorage nếu có
  useEffect(() => {
    const saved = localStorage.getItem(`board-${boardId}-cards`);
    if (saved) {
      setCards(JSON.parse(saved));
    }
  }, [boardId]);

  // Lưu vào localStorage mỗi khi cards thay đổi
  useEffect(() => {
    localStorage.setItem(`board-${boardId}-cards`, JSON.stringify(cards));
  }, [cards, boardId]);

  // WebSocket để cập nhật realtime
  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8000/ws/boards/' + boardId + '/');
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'card_update') {
        setCards(data.cards);
      }
    };
    return () => socket.close();
  }, [boardId]);

  const toggleTab = (tabName) => {
    setActiveTabs((prev) =>
      prev.includes(tabName)
        ? prev.length > 1
          ? prev.filter((t) => t !== tabName)
          : prev
        : [...prev, tabName]
    );
  };

  const handleAddCard = () => {
    if (inputValue.trim() === '') return;
    setCards([...cards, { text: inputValue, completed: false }]);
    setInputValue('');
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newCards = Array.from(cards);
    const [moved] = newCards.splice(result.source.index, 1);
    newCards.splice(result.destination.index, 0, moved);
    setCards(newCards);
    if (editPopup) setEditPopup(null);
  };

  const toggleComplete = (index) => {
    const updated = [...cards];
    updated[index].completed = true;
    setCards([...updated]);
    setTimeout(() => {
      const fresh = [...updated];
      const [completedCard] = fresh.splice(index, 1);
      setCards(fresh);
      setArchived((prev) => [...prev, completedCard]);
    }, 1000);
  };

  const handleSaveCard = () => {
    if (editPopup) {
      const updated = [...cards];
      updated[editPopup.index].text = editPopup.text;
      setCards(updated);
      setEditPopup(null);
    }
  };

  const renderPanes = () => {
    const panes = [];

    if (activeTabs.includes('inbox'))
      panes.push(
        <InboxPane
          key="inbox"
          background={background}
          cards={cards}
          setCards={setCards}
          inputValue={inputValue}
          setInputValue={setInputValue}
          showInput={showInput}
          setShowInput={setShowInput}
          editPopup={editPopup}
          setEditPopup={setEditPopup}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          handleAddCard={handleAddCard}
          onDragEnd={onDragEnd}
          toggleComplete={toggleComplete}
          handleSaveCard={handleSaveCard}
        />
      );

    if (activeTabs.includes('planner')) panes.push(<PlannerPane key="planner" background={background} />);
    if (activeTabs.includes('board')) panes.push(<BoardPane key="board" background={background} />);

    return panes;
  };

  if (loading) return <div>Loading board...</div>;

  return (
    <>
      {editPopup && <DarkOverlay />}
      {selectedCard && (
        <FullCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      <BoardWrapper background={background}>
        <SplitContainer>{renderPanes()}</SplitContainer>
        <BottomFloatingNav
          activeTabs={activeTabs}
          toggleTab={toggleTab}
          activeCount={activeTabs.length}
        />
      </BoardWrapper>
    </>
  );
}

const BoardWrapper = styled.div`
  background: ${({ background }) => background};
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const SplitContainer = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  > * {
    flex: 1;
    min-width: 240px;
    overflow-y: auto;
    background: #ffffff;
    border-left: 1px solid #ddd;
    &:first-child {
      border-left: none;
    }
  }
`;

const DarkOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
`;
