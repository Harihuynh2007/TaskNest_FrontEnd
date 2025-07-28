import React from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import CardItem from './CardItem';

function ListColumn({
  list,
  background,
  textColor,
  cardInput,
  setCardInputs,
  activeCardInput,
  setActiveCardInput,
  onAddCard,
  hideEmptyCards = false,
}) {
  const handleInputChange = (e) => {
    setCardInputs((prev) => ({ ...prev, [list.id]: e.target.value }));
  };

  const handleAddCard = () => {
    onAddCard(list.id);
  };

  const isInputActive = activeCardInput === list.id;
  const hasCards = Array.isArray(list.cards) && list.cards.length > 0;

  return (
    <Wrapper>
      <Header style={{ color: textColor }}>{list.name}</Header>

      {/* Conditionally render the Droppable only if cards exist or hiding is disabled */}
      {!hideEmptyCards || hasCards ? (
        <Droppable droppableId={`list-${list.id}`} type="CARD">
          {(provided) => (
            <CardList ref={provided.innerRef} {...provided.droppableProps}>
              {hasCards && list.cards.map((card, index) => (
                <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <CardItem
                        card={card}
                        index={index}
                        isDragging={snapshot.isDragging}
                        onEditClick={() => {}}
                        onCheckClick={() => {}}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </CardList>
          )}
        </Droppable>
      ) : null}

      {isInputActive ? (
        <CardInputWrapper>
          <Input
            value={cardInput}
            onChange={handleInputChange}
            placeholder="Enter a card title..."
            autoFocus
          />
          <AddButton onClick={handleAddCard}>Add</AddButton>
        </CardInputWrapper>
      ) : (
        <AddCardBtn onClick={() => setActiveCardInput(list.id)}>+ Add a card</AddCardBtn>
      )}
    </Wrapper>
  );
}

export default React.memo(ListColumn);




const Wrapper = styled.div`
  min-width: 260px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 20px;
`;

const Card = styled.div`
  background: white;
  padding: 10px;
  border-radius: 6px;
  box-shadow: ${({ isDragging }) =>
    isDragging ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)'};
  border: ${({ isDragging }) => (isDragging ? '2px solid #0c66e4' : 'none')};
  transition: all 0.2s ease;
  font-size: 14px;
`;

const CardInputWrapper = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Input = styled.textarea`
  padding: 8px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
  resize: none;
`;

const AddButton = styled.button`
  background: #0c66e4;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
`;

const AddCardBtn = styled.button`
  margin-top: 8px;
  background: transparent;
  border: none;
  color: #172b4d;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
`;
