import React, { useState } from 'react';
import styled from 'styled-components';
import InboxSubHeader from '../InboxSubHeader';
import { FaPlus, FaTimes } from 'react-icons/fa';
import ListColumn from '../../../components/ListColumn';
import FullCardModal from '../../../components/FullCardModal';
import CardEditPopup from '../CardEditPopup';
import { DragDropContext } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';

function getTextColor(bg) {
  const hex = bg?.startsWith('#') ? bg.slice(1) : 'ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? '#172b4d' : 'white';
}

export default function BoardPane({ background }) {
  const [lists, setLists] = useState([
    { id: 1, title: 'To Do', cards: [] },
    { id: 2, title: 'Doing', cards: [] },
    { id: 3, title: 'Done', cards: [] },
  ]);
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [activeCardInput, setActiveCardInput] = useState(null);
  const [cardInputs, setCardInputs] = useState({});
  const [editPopup, setEditPopup] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleAddList = () => {
    if (!newListTitle.trim()) return;
    const newList = {
      id: Date.now(),
      title: newListTitle,
      cards: [],
    };
    setLists([...lists, newList]);
    setNewListTitle('');
    setShowAddList(false);
  };

  const handleAddCard = (listId) => {
    const text = cardInputs[listId]?.trim();
    if (!text) return;
    const newCard = {
      id: uuidv4(),
      title: text,
      description: '',
      dueDate: null,
      completed: false,
    };
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
      )
    );
    setCardInputs({ ...cardInputs, [listId]: '' });
    setActiveCardInput(null);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceListId = parseInt(source.droppableId.replace('list-', ''));
    const destListId = parseInt(destination.droppableId.replace('list-', ''));

    setLists((prevLists) => {
      const sourceListIndex = prevLists.findIndex((l) => l.id === sourceListId);
      const destListIndex = prevLists.findIndex((l) => l.id === destListId);
      if (sourceListIndex === -1 || destListIndex === -1) return prevLists;

      const newLists = [...prevLists];
      const sourceCards = Array.from(newLists[sourceListIndex].cards);
      const [movedCard] = sourceCards.splice(source.index, 1);

      if (sourceListId === destListId) {
        sourceCards.splice(destination.index, 0, movedCard);
        newLists[sourceListIndex] = {
          ...newLists[sourceListIndex],
          cards: sourceCards,
        };
      } else {
        const destCards = Array.from(newLists[destListIndex].cards);
        destCards.splice(destination.index, 0, movedCard);
        newLists[sourceListIndex] = {
          ...newLists[sourceListIndex],
          cards: sourceCards,
        };
        newLists[destListIndex] = {
          ...newLists[destListIndex],
          cards: destCards,
        };
      }

      return newLists;
    });
  };

  const textColor = getTextColor(background);

  return (
    <Wrapper background={background}>
      {editPopup && <DarkOverlay />}
      {selectedCard && (
        <FullCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      {editPopup && (
        <CardEditPopup
          anchorRect={editPopup.anchorRect}
          cardText={editPopup.text}
          onChange={(val) => setEditPopup({ ...editPopup, text: val })}
          onSave={() => {
            setLists((prev) =>
              prev.map((list) =>
                list.id === editPopup.listId
                  ? {
                      ...list,
                      cards: list.cards.map((c, i) =>
                        i === editPopup.index ? { ...c, title: editPopup.text } : c
                      ),
                    }
                  : list
              )
            );
            setEditPopup(null);
          }}
          onClose={() => setEditPopup(null)}
          onOpenFullCard={() => {
            setEditPopup(null);
            setSelectedCard(editPopup.card);
          }}
        />
      )}

      <InboxSubHeader />
      <DragDropContext onDragEnd={onDragEnd}>
        <BoardContent>
          {lists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              background={background}
              textColor={textColor}
              cardInput={cardInputs[list.id] || ''}
              setCardInputs={setCardInputs}
              activeCardInput={activeCardInput}
              setActiveCardInput={setActiveCardInput}
              onAddCard={handleAddCard}
              onEditClick={(e, card, index) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setEditPopup({
                  anchorRect: rect,
                  index,
                  text: card.title,
                  card,
                  listId: list.id,
                });
              }}
              onCheckClick={() => {}}
              onCardClick={(card) => setSelectedCard(card)}
            />
          ))}

          {showAddList ? (
            <AddListForm background={background}>
              <ListTitleInput
                placeholder="Enter list name..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                autoFocus
              />
              <ActionRow>
                <AddBtn onClick={handleAddList}>Add list</AddBtn>
                <PlaceholderBtn>Add from ▾</PlaceholderBtn>
                <CloseBtn onClick={() => setShowAddList(false)}>
                  <FaTimes aria-label="Close form" />
                </CloseBtn>
              </ActionRow>
            </AddListForm>
          ) : (
            <AddListTrigger background={background} style={{ color: textColor }} onClick={() => setShowAddList(true)}>
              <FaPlus aria-label="Add another list" size={12} style={{ marginRight: 6 }} /> Add another list
            </AddListTrigger>
          )}
        </BoardContent>
      </DragDropContext>
    </Wrapper>
  );
}




const Wrapper = styled.div`
  background: ${(props) => props.background || '#f4f5f7'};
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const BoardContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 16px;
  overflow-x: auto;
  flex: 1;
`;

const AddListForm = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  backdrop-filter: blur(2px);
`;

const ListTitleInput = styled.input`
  padding: 8px;
  border-radius: 4px;
  border: 2px solid #0c66e4;
  outline: none;
  font-size: 14px;
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AddBtn = styled.button`
  background: #0c66e4;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const PlaceholderBtn = styled.button`
  background: transparent;
  border: none;
  color: #1e1e1e;
  font-size: 14px;
  cursor: default;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;

const AddListTrigger = styled.button`
  background: ${(props) => props.background || '#d0bfff'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: fit-content;
`;
const DarkOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
`;
