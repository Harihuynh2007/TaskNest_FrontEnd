
// ✅ BoardPane.jsx đã cập nhật kéo list và card giống Trello
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BoardSubHeader from '../../../components/BoardSubHeader';
import { FaPlus, FaTimes } from 'react-icons/fa';
import ListColumn from '../../../components/ListColumn';
import FullCardModal from '../../../components/FullCardModal';
import CardEditPopup from '../CardEditPopup';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createList, fetchLists, updateList } from '../../../api/listApi';
import { createCard, fetchCards, updateCard } from '../../../api/cardApi';

function getTextColor(bg) {
  const hex = bg?.startsWith('#') ? bg.slice(1) : 'ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? '#172b4d' : 'white';
}

export default function BoardPane({ background, boardId }) {
  const [lists, setLists] = useState([]);
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [activeCardInput, setActiveCardInput] = useState(null);
  const [cardInputs, setCardInputs] = useState({});
  const [editPopup, setEditPopup] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const loadListsAndCards = async () => {
      try {
        const resLists = await fetchLists(boardId);
        const listsWithCards = await Promise.all(
          resLists.data.map(async (list) => {
            const resCards = await fetchCards(list.id);
            return { ...list, cards: Array.isArray(resCards.data) ? resCards.data : [] };
          })
        );
        setLists(listsWithCards);
      } catch (err) {
        console.error('❌ Failed to fetch lists/cards:', err);
      }
    };
    if (boardId) loadListsAndCards();
  }, [boardId]);

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const res = await createList(boardId, {
        name: newListTitle,
        background: '',
        visibility: 'private',
        board: boardId,
      });
      setLists((prev) => [...prev, { ...res.data, cards: [] }]);
      setNewListTitle('');
      setShowAddList(false);
    } catch (err) {
      console.error('❌ Failed to create list:', err);
    }
  };

  const handleAddCard = async (listId) => {
    const text = cardInputs[listId]?.trim();
    if (!text) return;
    try {
      const res = await createCard(listId, {
        name: text,
        status: 'doing',
        background: '',
        visibility: 'private',
      });
      const newCard = res.data;
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId ? { ...list, cards: [...(list.cards || []), newCard] } : list
        )
      );
      setCardInputs((prev) => ({ ...prev, [listId]: '' }));
      setActiveCardInput(null);
    } catch (err) {
      console.error('❌ Failed to create card:', err);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'column') {
      setLists((prev) => {
        const newLists = [...prev];
        const [moved] = newLists.splice(source.index, 1);
        newLists.splice(destination.index, 0, moved);

        newLists.forEach((list, index) => {
          updateList(list.id, { position: index });  
        });
        return newLists;
      });
      return;
    }

    const sourceListId = parseInt(source.droppableId);
    const destListId = parseInt(destination.droppableId);
    const cardId = parseInt(draggableId);

    setLists((prev) => {
      const newLists = [...prev];
      const sourceList = newLists.find((l) => l.id === sourceListId);
      const destList = newLists.find((l) => l.id === destListId);
      if (!sourceList || !destList) return prev;

      const cardIndex = sourceList.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return prev;

      const [movedCard] = sourceList.cards.splice(cardIndex, 1);
      destList.cards.splice(destination.index, 0, movedCard);
      return newLists;
    });

    try {
      await updateCard(cardId, { list: destListId });
    } catch (err) {
      console.error('❌ Failed to update card list:', err);
    }
  };

  const textColor = getTextColor(background);

  return (
    <Wrapper background={background}>
      <BoardSubHeader boardName="My Board" />
      {editPopup && <DarkOverlay />}
      {selectedCard && <FullCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
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
                        i === editPopup.index ? { ...c, name: editPopup.text } : c
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

      <DragDropContext onDragEnd={onDragEnd}>

        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <BoardContent {...provided.droppableProps} ref={provided.innerRef}>
              {lists.map((list, index) => (
                <Draggable key={list.id} draggableId={`list-${list.id}`} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <ListColumn
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
                          setEditPopup({ anchorRect: rect, index, text: card.name, card, listId: list.id });
                        }}
                        onCheckClick={(index) => {
                          setLists((prev) =>
                            prev.map((l) =>
                              l.id === list.id
                                ? {
                                    ...l,
                                    cards: l.cards.map((c, i) =>
                                      i === index ? { ...c, completed: !c.completed } : c
                                    ),
                                  }
                                : l
                            )
                          );
                        }}
                        onCardClick={(card) => setSelectedCard(card)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </BoardContent>
          )}
        </Droppable>
      </DragDropContext>

      {showAddList ? (
        <AddListForm onSubmit={handleAddList}>
          <ListTitleInput
            placeholder="Enter list title..."
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            autoFocus
          />
          <AddListButtons>
            <AddBtn type="submit">Add list</AddBtn>
            <AddFromBtn type="button">Add from ▾</AddFromBtn>
            <CloseBtn type="button" onClick={() => setShowAddList(false)}>✕</CloseBtn>
          </AddListButtons>
        </AddListForm>

      ) : (
        <AddListTrigger onClick={() => setShowAddList(true)}>
          <AddIcon>＋</AddIcon> Add another list
        </AddListTrigger>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`background: ${(props) => props.background}; height: 100%; overflow: auto;`;
const DarkOverlay = styled.div`position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); z-index: 998;`;

const BoardContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: flex-start;
  padding: 12px;
  overflow-x: auto;
`;

const ListTitleInput = styled.textarea`
  width: 100%;
  min-height: 20px;
  max-height: 256px;
  height: 32px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  resize: none;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #172b4d;
  background-color: #ffffff;
  box-shadow: inset 0 0 0 1px #091e4224;
  outline: none;
  overflow: hidden;
  box-sizing: border-box;
  transition: background-color 85ms ease, border-color 85ms ease, box-shadow 85ms ease;

  &:focus {
    box-shadow: inset 0 0 0 2px #28a745;
  }

  `;


const AddListForm = styled.form`
  display: flex;
  flex-direction: column;
  min-width: 272px;
  max-width: 272px;
  background-color: #ffffff3d;
  padding: 12px;
  border-radius: 12px;
`;

const AddListTrigger = styled.button` 
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 272px;
  padding: 12px;
  border-radius: 12px;
  background-color: #ffffff3d;
  border: none;
  color: #172b4d;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 85ms ease;

  &:hover {
    background-color: #ffffff52;
  }
`;

const AddIcon = styled.span`
  font-size: 18px;
  line-height: 1;
  font-weight: bold;
`;

const AddListButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const AddBtn = styled.button`
  background-color: #28a745;
  color: white;
  padding: 6px 12px;
  font-weight: 500;
  border: none;
  border-radius: 3px;
  cursor: pointer;
`;

const AddFromBtn = styled.button`
  background: transparent;
  border: none;
  color: #172b4d;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: #44546f;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #172b4d;
  }
`;

