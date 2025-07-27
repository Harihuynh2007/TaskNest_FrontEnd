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
  onEditClick,
  onCheckClick,
  onCardClick,
}) {
  const handleInputChange = (e) => {
    setCardInputs((prev) => ({ ...prev, [list.id]: e.target.value }));
  };

  const handleAddCard = () => {
    onAddCard(list.id);
  };

  const isInputActive = activeCardInput === list.id;

  return (
    <Wrapper>
      <Header style={{ color: textColor }}>{list.title}</Header>

      <Droppable droppableId={`list-${list.id}`} type="CARD">
        {(provided) => (
          <CardList ref={provided.innerRef} {...provided.droppableProps}>
            {list.cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <CardItem
                      card={card}
                      index={index}
                      isDragging={snapshot.isDragging}
                      onEditClick={(e, card, index) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        onEditClick(e, card, index, rect);
                      }}
                      onCheckClick={() => onCheckClick(index)}
                      onCardClick={() => onCardClick(card)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </CardList>
        )}
      </Droppable>

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

// ⚠️ Styled-components giữ nguyên như cũ
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
