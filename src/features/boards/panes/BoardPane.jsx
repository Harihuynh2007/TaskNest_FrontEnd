
// ✅ BoardPane.jsx đã cập nhật kéo list và card giống Trello
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InboxSubHeader from '../InboxSubHeader';
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

  const handleAddList = async () => {
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

      <InboxSubHeader />
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
    </Wrapper>
  );
}

const Wrapper = styled.div`background: ${(props) => props.background}; height: 100%; overflow: hidden;`;
const BoardContent = styled.div`display: flex; gap: 16px; padding: 16px; overflow-x: auto;`;
const AddListForm = styled.div`padding: 12px; background: rgba(255,255,255,0.1); border-radius: 8px;`;
const ListTitleInput = styled.input`padding: 8px; width: 100%;`;
const ActionRow = styled.div`display: flex; gap: 8px;`;
const AddBtn = styled.button`background: #0c66e4; color: white; padding: 6px 12px;`;
const PlaceholderBtn = styled.button`background: transparent;`;
const CloseBtn = styled.button`background: transparent;`;
const AddListTrigger = styled.button`background: #d0bfff; padding: 12px; border-radius: 8px; display: flex; align-items: center;`;
const DarkOverlay = styled.div`position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); z-index: 998;`;
