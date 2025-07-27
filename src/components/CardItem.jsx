import React, { useState } from 'react';
import styled from 'styled-components';

export default function CardItem({
  card,
  index,
  isDragging,
  onEditClick,
  onCheckClick,
  onCardClick = () => {},
}) {
  const [hovered, setHovered] = useState(false);

  return (

    <Card
        isDragging={isDragging}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onCardClick(card)}
        >
        <CheckCircle
            visible={hovered || card.completed}
            onClick={(e) => {
            e.stopPropagation();
            onCheckClick(index);
            }}
        >
            {card.completed ? '✅' : '○'}
        </CheckCircle>

        <CardText $hovered={hovered} completed={card.completed}>
          {card.name || card.title || '(Untitled)'}
        </CardText>


        <EditIcon
          aria-label="Edit card"
          onClick={(e) => {

            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            onEditClick(e, card, index, rect);
            }}
            >
              <svg viewBox="0 0 16 16" role="presentation">
                <path
                  fill="currentColor"
                  d="M11.586.854a2 2 0 0 1 2.828 0l.732.732a2 2 0 0 1 0 2.828L10.01 9.551a2 2 0 0 1-.864.51l-3.189.91a.75.75 0 0 1-.927-.927l.91-3.189a2 2 0 0 1 .51-.864zm1.768 1.06a.5.5 0 0 0-.708 0l-.585.586L13.5 3.94l.586-.586a.5.5 0 0 0 0-.707zM12.439 5 11 3.56 7.51 7.052a.5.5 0 0 0-.128.217l-.54 1.89 1.89-.54a.5.5 0 0 0 .217-.127zM3 2.501a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5v-3H15v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h3v1.5z"
                />
              </svg>
          </EditIcon>

    </Card>

  );
}
const Card = styled.div`
  position: relative;
  background: white;
  padding: 8px 12px 4px 12px; /* ✅ padding trái mặc định 12px */
  border-radius: 6px;
  display: flex;
  align-items: center;
  border: ${({ isDragging }) =>
    isDragging ? '2px solid #0c66e4' : '1px solid transparent'};
  box-shadow: ${({ isDragging }) =>
    isDragging ? '0 4px 12px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)'};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border: 2px solid #0c66e4;
  }
`;

const CheckCircle = styled.div`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  font-size: 16px;
  border-radius: 50%;
  display: ${({ visible }) => (visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    background: #f0f0f0;
  }
`;

const CardText = styled.div`
  flex: 1;
  font-size: 14px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #172b4d;
  transform: ${({ $hovered }) => ($hovered ? 'translateX(20px)' : 'translateX(0)')};
  transition: transform 0.5s ease;
  ${({ completed }) =>
    completed && 'text-decoration: line-through; opacity: 0.6;'}

  will-change: transform;
`;

const EditIcon = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 28px;
  height: 28px;
  padding: 0;
  background: #f4f5f7;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #172b4d;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`;

