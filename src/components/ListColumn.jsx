import React from 'react';
import styled from 'styled-components';
import { FaPlus, FaTimes, FaEllipsisH } from 'react-icons/fa';
import { Droppable, Draggable } from '@hello-pangea/dnd';

export default function ListColumn({
  list,
  background,
  textColor,
  cardInput,
  setCardInputs,
  activeCardInput,
  setActiveCardInput,
  onAddCard,
}) {
  return (
    <Droppable droppableId={`list-${list.id}`} type="CARD" direction="vertical">
      {(provided) => (
        <List
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <ListHeader>
            <ListTitle style={{ color: textColor }}>{list.title}</ListTitle>
            <FaEllipsisH style={{ cursor: 'pointer', color: textColor }} />
          </ListHeader>

          {list.cards.map((card, index) => (
            <Draggable key={card + index} draggableId={card + list.id} index={index}>
              {(provided, snapshot) => (
                <Card
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  isDragging={snapshot.isDragging}
                  style={provided.draggableProps.style} // ✅ fix positioning
                >
                  {card}
                </Card>
              )}
            </Draggable>
          ))}
          {provided.placeholder}

          {activeCardInput === list.id ? (
            <CardInputWrapper>
              <CardInput
                placeholder="Enter a title or paste a link"
                value={cardInput}
                onChange={(e) =>
                  setCardInputs((prev) => ({ ...prev, [list.id]: e.target.value }))
                }
                autoFocus
              />
              <ActionRow>
                <AddBtn onClick={() => onAddCard(list.id)}>Add card</AddBtn>
                <CloseBtn onClick={() => setActiveCardInput(null)}>
                  <FaTimes />
                </CloseBtn>
              </ActionRow>
            </CardInputWrapper>
          ) : (
            <AddCardTrigger onClick={() => setActiveCardInput(list.id)}>
              <FaPlus size={12} style={{ marginRight: 6 }} /> Add a card
            </AddCardTrigger>
          )}
        </List>
      )}
    </Droppable>
  );
}

const List = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  width: 272px;
  min-width: 272px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  // backdrop-filter: blur(2px);  // Comment out or remove this to fix drag positioning
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ListTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
`;

const Card = styled.div`
  background: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: ${({ isDragging }) =>
    isDragging ? '0 4px 12px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0, 0, 0, 0.1)'};
  user-select: none;
  transition: box-shadow 0.2s;
  position: relative;
`;

const CardInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CardInput = styled.input`
  padding: 8px;
  border-radius: 4px;
  border: 2px solid #0c66e4;
  outline: none;
  font-size: 14px;
`;

const AddCardTrigger = styled.button`
  background: #dfe1e6;
  color: #172b4d;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
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

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;
