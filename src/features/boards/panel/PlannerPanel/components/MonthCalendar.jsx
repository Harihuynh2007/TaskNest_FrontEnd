import React, { useMemo } from "react";
import styled from "styled-components";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { motion } from "framer-motion";

dayjs.extend(isoWeek);

export default function MonthCalendar({ currentDate, cards, onCardClick }) {
  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startOfGrid = startOfMonth.startOf("week");
  const endOfGrid = endOfMonth.endOf("week");

  const days = [];
  for (let d = startOfGrid; d.isBefore(endOfGrid) || d.isSame(endOfGrid, "day"); d = d.add(1, "day")) {
    days.push(d);
  }

  const cardsByDate = useMemo(() => {
    const grouped = {};
    cards.forEach(card => {
      const date = card.due_date ? dayjs(card.due_date).format("YYYY-MM-DD") : null;
      if (date) {
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(card);
      }
    });
    return grouped;
  }, [cards]);

  return (
    <CalendarGrid>
      {days.map((date) => {
        const key = date.format("YYYY-MM-DD");
        const cardList = cardsByDate[key] || [];
        const isToday = date.isSame(dayjs(), "day");
        const isCurrentMonth = date.month() === currentDate.month();

        return (
          <Droppable key={key} droppableId={key} type="CARD">
            {(provided, snapshot) => (
              <DayCell
                ref={provided.innerRef}
                {...provided.droppableProps}
                $isToday={isToday}
                $isCurrentMonth={isCurrentMonth}
                $isDraggingOver={snapshot.isDraggingOver}
              >
                <DayHeader>{date.format("D")}</DayHeader>
                <CardList>
                  {cardList.map((card, index) => (
                    <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          layout
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
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
                </CardList>
              </DayCell>
            )}
          </Droppable>
        );
      })}
    </CalendarGrid>
  );
}

// Styled
const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  min-height: 100%;
`;

const DayCell = styled.div`
  background: ${({ $isDraggingOver }) =>
    $isDraggingOver ? "rgba(59,130,246,0.12)" : "var(--surface-2, #1e293b)"};
  border: 1px solid #2b3342;
  border-radius: 10px;
  padding: 8px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  transition: 0.2s ease;

  ${({ $isToday }) => $isToday && `box-shadow: 0 0 0 2px #3b82f6;`}
  ${({ $isCurrentMonth }) =>
    !$isCurrentMonth && `opacity: 0.4;`}
`;

const DayHeader = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 4px;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardItem = styled.div`
  padding: 6px 8px;
  background: ${({ $isDragging }) =>
    $isDragging
      ? "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)"
      : "var(--surface-3, #2c3341)"};
  border-radius: 6px;
  font-size: 13px;
  color: #e2e8f0;
  cursor: pointer;
  user-select: none;
  transition: 0.2s ease;
  &:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  }
`;
