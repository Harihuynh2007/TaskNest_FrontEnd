// BoardDetailPage.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import InboxSubHeader from './InboxSubHeader';
import CardEditPopup from './CardEditPopup';
import FullCardModal from '../../components/FullCardModal';

export default function BoardDetailPage() {
  const [cards, setCards] = useState([]);
  const [archived, setArchived] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [editPopup, setEditPopup] = useState(null); // { index, text, anchorRect }
  const [selectedCard, setSelectedCard] = useState(null);

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
    // Đóng popup nếu đang mở để tránh bug position
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

  return (
    <>
      {editPopup && <DarkOverlay />} {/* overlay làm tối nền */}
      {selectedCard && (
        <FullCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
      <BoardWrapper>
        <CenterColumn>
          <InboxSubHeader />
          {showInput ? (
            <CardInputWrapper>
              <Input
                placeholder="Enter a title"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
              />
              <ButtonRow>
                <AddButton onClick={handleAddCard}>Add card</AddButton>
                <CancelButton
                  onClick={() => {
                    setShowInput(false);
                    setInputValue('');
                  }}
                >
                  Cancel
                </CancelButton>
              </ButtonRow>
            </CardInputWrapper>
          ) : (
            <AddCardTrigger onClick={() => setShowInput(true)}>
              Add a card
            </AddCardTrigger>
          )}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="cardList">
              {(provided) => (
                <CardList ref={provided.innerRef} {...provided.droppableProps}>
                  {cards.map((card, index) => (
                    <Draggable
                      key={card.text + index}
                      draggableId={card.text + index}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          isDragging={snapshot.isDragging}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setEditPopup({ index, text: card.text, anchorRect: rect });
                          }}
                        >
                          <CheckCircle
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComplete(index);
                            }}
                            title={card.completed ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {card.completed ? '✅' : '○'}
                          </CheckCircle>

                          <CardText completed={card.completed}>{card.text}</CardText>

                          <EditIcon
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.parentElement.getBoundingClientRect();
                              setEditPopup({ index, text: card.text, anchorRect: rect });
                            }}
                          >
                            ✏️
                          </EditIcon>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </CardList>
              )}
            </Droppable>
          </DragDropContext>

          {editPopup && (
            <CardEditPopup
              anchorRect={editPopup.anchorRect}
              cardText={editPopup.text}
              onChange={(val) => setEditPopup({ ...editPopup, text: val })}
              onSave={handleSaveCard}
              onClose={() => setEditPopup(null)}
              onOpenFullCard={() => {
                setEditPopup(null);
                setSelectedCard(cards[editPopup.index]);
              }}
            />
          )}
        </CenterColumn>
      </BoardWrapper>
    </>
  );
}

const BoardWrapper = styled.div`
  background: #e7effa;
  min-height: 100vh;
  display: flex;
  justify-content: center;
`;

const CenterColumn = styled.div`
  width: 100%;
  max-width: 784px;
`;

const DarkOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
`;

const CardInputWrapper = styled.div`
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  margin: 16px 0;
`;

const Input = styled.textarea`
  width: 100%;
  min-height: 36px;
  resize: none;
  font-size: 14px;
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #dfe1e6;
  box-shadow: inset 0 0 0 2px #388bff;
  outline: none;
`;

const ButtonRow = styled.div`
  margin-top: 6px;
  display: flex;
  gap: 6px;
  align-items: center;
`;

const AddButton = styled.button`
  background: #28a745;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 600;
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: #5e6c84;
  font-weight: 500;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Card = styled.div`
  position: relative;
  background: white;
  padding: 10px 12px 10px 48px;
  border-radius: 6px;
  box-shadow: ${({ isDragging }) =>
    isDragging ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)'};
  border: ${({ isDragging }) => (isDragging ? '2px solid #0c66e4' : 'none')};
  transition: all 0.2s ease;
  cursor: grab;
  display: flex;
  align-items: center;

  &:hover .card-text {
    transform: translateX(8px);
  }

  &:hover .edit-icon {
    opacity: 1;
  }
`;

const CardText = styled.div`
  font-size: 16px;
  transition: transform 0.2s ease;
  flex: 1;
  ${({ completed }) =>
    completed && 'text-decoration: line-through; opacity: 0.6;'}
`;

const CheckCircle = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`;

const AddCardTrigger = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 16px 0;
  font-size: 14px;
  color: #172b4d;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(9, 30, 66, 0.14);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #dfe1e6;
  }
`;

const EditIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: #f4f5f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #172b4d;
  opacity: 1;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 0 0 1px rgba(9, 30, 66, 0.08);

  &:hover::after {
    content: 'Edit card';
    position: absolute;
    bottom: -30px;
    right: 0;
    background: #42526e;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
  }
`;