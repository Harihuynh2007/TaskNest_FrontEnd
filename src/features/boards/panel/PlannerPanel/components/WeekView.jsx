import React from "react";
import styled from "styled-components";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import dayjs from "dayjs";

export default function WeekView({ currentDate, cards, onCardClick }) {
  const startOfWeek = currentDate.startOf("week");
  const days = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, "day"));
  const grouped = {};

  cards.forEach((card) => {
    if (card.due_date) {
      const date = dayjs(card.due_date).format("YYYY-MM-DD");
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(card);
    }
  });

  return (
    <WeekContainer>
      {days.map((date) => {
        const key = date.format("YYYY-MM-DD");
        const cardList = grouped[key] || [];
        const isToday = date.isSame(dayjs(), "day");

        return (
          <Droppable key={key} droppableId={key} type="CARD">
            {(provided, snapshot) => (
              <DayColumn
                ref={provided.innerRef}
                {...provided.droppableProps}
                $isDraggingOver={snapshot.isDraggingOver}
                $isToday={isToday}
              >
                <Header>{date.format("ddd D")}</Header>
                {cardList.map((card, i) => (
                  <Draggable key={card.id} draggableId={String(card.id)} index={i}>
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        layout
                        whileHover={{ scale: 1.03 }}
                      >
                        <CardItem
                          $isDragging={snapshot.isDragging}
                          onClick={() => onCardClick(card)}
                        >
                          {card.name}
                        </CardItem>
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </DayColumn>
            )}
          </Droppable>
        );
      })}
    </WeekContainer>
  );
}

const WeekContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const DayColumn = styled.div`
  background: ${({ $isDraggingOver }) =>
    $isDraggingOver ? "rgba(59,130,246,0.12)" : "var(--surface-2, #1e293b)"};
  border-radius: 10px;
  padding: 10px;
  min-height: 200px;
  transition: 0.2s ease;
  ${({ $isToday }) => $isToday && `box-shadow: 0 0 0 2px #3b82f6;`}
`;

const Header = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 8px;
`;

const CardItem = styled.div`
  padding: 8px 10px;
  background: ${({ $isDragging }) =>
    $isDragging
      ? "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)"
      : "var(--surface-3, #2c3341)"};
  border-radius: 6px;
  font-size: 13px;
  color: #e2e8f0;
  margin-bottom: 4px;
  cursor: pointer;
  transition: 0.2s ease;
  &:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  }
`;
