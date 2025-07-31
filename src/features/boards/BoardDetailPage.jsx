import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import InboxPane from './panes/InboxPane';
import PlannerPane from './panes/PlannerPane';
import BoardPane from './panes/BoardPane';

import dayjs from 'dayjs';

import BottomFloatingNav from './BottomFloatingNav';
import FullCardModal from '../../components/Card/FullCardModal.jsx';

import { getBoard } from '../../api/boardApi.js';
import { DragDropContext } from '@hello-pangea/dnd';

import { fetchInboxCards, updateCard, createCard } from '../../api/cardApi';


export default function BoardDetailPage() {
  const { workspaceId, boardId } = useParams();
  const numericBoardId = parseInt(boardId);
  const [background, setBackground] = useState('#e4f0f6');
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState(['inbox']);
  const [cards, setCards] = useState([]);
  const [lists, setLists] = useState([
    { id: 1, title: 'To Do', cards: [] },
    { id: 2, title: 'Doing', cards: [] },
    { id: 3, title: 'Done', cards: [] },
  ]);
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

  useEffect(() => {
    const loadInboxCards = async () => {
      try {
        const res = await fetchInboxCards(); // gọi API cards/ => card không có list
        setCards(res.data || []);
      } catch (err) {
        console.error('❌ Lỗi load inbox cards:', err);
      }
    };
    loadInboxCards();
  }, [boardId]);


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

  const handleAddCard = async () => {
    if (inputValue.trim() === '') return;

    try {
      const res = await createCard(null, {
        name: inputValue,
        status: 'doing',
        background: '',
        visibility: 'private',
        description: '',
        due_date: dayjs().toISOString(),
        completed: false,
        position: cards.length,  // ✅ GÁN POSITION CHUẨN!
        
      });

      setCards((prev) => [...prev, res.data]);
      setInputValue('');
    } catch (err) {
      console.error('❌ Lỗi tạo card inbox:', err);
    }
  };



  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const ensureCardStructure = (card) => ({
      id: card.id,
      name: card.name || '',
      description: card.description || '',
      due_date: card.due_date || null,
      completed: card.completed ?? false,
      list: card.list || null,
      visibility: card.visibility || 'private',
      status: card.status || 'doing',
      position: card.position ?? 0,
    });

    let movedCard;

    // Reorder trong cùng 1 danh sách
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'inbox') {
        const newCards = Array.from(cards);
        [movedCard] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, ensureCardStructure(movedCard));
        setCards(newCards);

        // ✅ Gửi PATCH cập nhật position
        for (let i = 0; i < newCards.length; i++) {
          if (newCards[i].position !== i) {
            try {
              await updateCard(newCards[i].id, { position: i });
            } catch (err) {
              console.error(`❌ Lỗi update position card ${newCards[i].id}`, err);
            }
          }
        }
      } else {
        // xử lý re-order trong cùng 1 list (To Do / Doing / Done)
        const listId = parseInt(source.droppableId.replace('list-', ''));
        setLists((prev) => {
          const listIndex = prev.findIndex((l) => l.id === listId);
          if (listIndex === -1) return prev;
          const newLists = [...prev];
          const newCards = Array.from(newLists[listIndex].cards);
          [movedCard] = newCards.splice(source.index, 1);
          newCards.splice(destination.index, 0, ensureCardStructure(movedCard));
          newLists[listIndex] = { ...newLists[listIndex], cards: newCards };
          return newLists;
        });
      }
    } else {
      // kéo từ Inbox → sang list
      if (source.droppableId === 'inbox') {
        const newCards = Array.from(cards);
        [movedCard] = newCards.splice(source.index, 1);
        setCards(newCards);

        const destListId = parseInt(destination.droppableId.replace('list-', ''));
        const destList = lists.find((l) => l.id === destListId);
        if (destList?.title === 'Done') movedCard.completed = true;

        setLists((prev) =>
          prev.map((list) =>
            list.id === destListId
              ? {
                  ...list,
                  cards: [
                    ...list.cards.slice(0, destination.index),
                    ensureCardStructure(movedCard),
                    ...list.cards.slice(destination.index),
                  ],
                }
              : list
          )
        );

        // ✅ Gửi update list và position
        try {
          await updateCard(movedCard.id, {
            list: destListId,
            position: destination.index,
          });
        } catch (err) {
          console.error('❌ Lỗi update card khi chuyển list:', err);
        }
      } else {
        // kéo từ list → sang Inbox
        const sourceListId = parseInt(source.droppableId.replace('list-', ''));
        setLists((prev) => {
          const sourceListIndex = prev.findIndex((l) => l.id === sourceListId);
          if (sourceListIndex === -1) return prev;
          const newLists = [...prev];
          const sourceCards = Array.from(newLists[sourceListIndex].cards);
          [movedCard] = sourceCards.splice(source.index, 1);
          if (newLists[sourceListIndex].title === 'Done') movedCard.completed = false;
          newLists[sourceListIndex] = {
            ...newLists[sourceListIndex],
            cards: sourceCards,
          };
          return newLists;
        });

        const newCards = Array.from(cards);
        newCards.splice(destination.index, 0, ensureCardStructure(movedCard));
        setCards(newCards);

        // ✅ Gửi update list=null và position
        try {
          await updateCard(movedCard.id, {
            list: null,
            position: destination.index,
          });
        } catch (err) {
          console.error('❌ Lỗi update card khi kéo về inbox:', err);
        }
      }
    }
  };


  const toggleTab = (tabName) => {
    setActiveTabs((prev) =>
      prev.includes(tabName)
        ? prev.length > 1
          ? prev.filter((t) => t !== tabName)
          : prev
        : [...prev, tabName]
    );
  };

  const toggleComplete = async (index) => {
    const updated = [...cards];
    const card = updated[index];
    const newCompleted = !card.completed;

    try {
      await updateCard(card.id, { completed: newCompleted });
      updated[index].completed = newCompleted;
      setCards(updated);
    } catch (err) {
      console.error('❌ Lỗi cập nhật completed:', err);
    }
  };


  const handleSaveCard = async () => {
    if (editPopup) {
      try {
        const updated = [...cards];
        const card = updated[editPopup.index];

        const res = await updateCard(card.id, {
          name: editPopup.text,
        });

        updated[editPopup.index] = { ...card, ...res.data };
        setCards(updated);
        setEditPopup(null);
      } catch (err) {
        console.error('❌ Lỗi update card:', err);
      }
    }
  };


  const renderPanes = () => (
    <SplitContainer>
      {activeTabs.includes('inbox') && (
        <InboxPane
          background="#e4f0f6"
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
          toggleComplete={toggleComplete}
          handleSaveCard={handleSaveCard}
        />
      )}
      {activeTabs.includes('planner') && <PlannerPane background="#e4f0f6" />}
      {activeTabs.includes('board') && <BoardPane background={background} boardId={numericBoardId} lists={lists} setLists={setLists} />}
    </SplitContainer>
  );

  if (loading) return <div>Loading board...</div>;

  return (
    <>
      {editPopup && <DarkOverlay />}
      {selectedCard && (
        <FullCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      <BoardWrapper background={background}>
        <DragDropContext onDragEnd={onDragEnd}>
          {renderPanes()}
        </DragDropContext>
        <BottomFloatingNav activeTabs={activeTabs} toggleTab={toggleTab} activeCount={activeTabs.length} />
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
