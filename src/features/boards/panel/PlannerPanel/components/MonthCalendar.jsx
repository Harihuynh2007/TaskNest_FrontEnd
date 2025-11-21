import React, { useMemo, memo } from "react";
import styled from "styled-components";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { motion } from "framer-motion";

dayjs.extend(isoWeek);

const MAX_CARDS_DISPLAY = 3;

// =========================
// Memo hóa CardItem
// =========================
const CardItem = memo(function CardItem({ card, isDragging, onClick }) {
  return (
    <StyledCardItem
      $isDragging={isDragging}
      onClick={(e) => {
        e.stopPropagation();
        onClick(card);
      }}
    >
      {card.name}
    </StyledCardItem>
  );
});

// =========================
// Memo hóa DayCell
// =========================
const DayCell = memo(function DayCell({
  date,
  cards,
  hiddenCount,
  isToday,
  isCurrentMonth,
  provided,
  snapshot,
  onCardClick,
  handleNavigateToDay,
}) {

  return (
    <CellWrapper
      ref={provided.innerRef}
      {...provided.droppableProps}
      $isToday={isToday}
      $isCurrentMonth={isCurrentMonth}
      $isDraggingOver={snapshot.isDraggingOver}
      onClick={(e) => handleNavigateToDay(e, date)}
    >
      <DayHeader>{date.format("D")}</DayHeader>

      <CardList>
        {cards.map((card, index) => (
          <Draggable key={card.id} draggableId={String(card.id)} index={index}>
            {(p, s) => (
              <motion.div
                layoutId={String(card.id)}
                ref={p.innerRef}
                {...p.draggableProps}
                {...p.dragHandleProps}
                whileHover={{ scale: 1.02 }}
              >
                <CardItem
                  card={card}
                  isDragging={s.isDragging}
                  onClick={onCardClick}
                />
              </motion.div>
            )}
          </Draggable>
        ))}

        {provided.placeholder}

        {hiddenCount > 0 && (
          <ShowMoreBtn onClick={(e) => handleNavigateToDay(e, date)}>
            + {hiddenCount} more
          </ShowMoreBtn>
        )}
      </CardList>
    </CellWrapper>
  );
});

// =========================
// MAIN COMPONENT
// =========================
function MonthCalendar({ currentDate, cards, onCardClick, setView, goToDate }) {
  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startOfGrid = startOfMonth.startOf("week");
  const endOfGrid = endOfMonth.endOf("week");

  // ========== Generate 42-day grid ==========
  const days = useMemo(() => {
    const arr = [];
    let d = startOfGrid;
    while (d.isBefore(endOfGrid) || d.isSame(endOfGrid, "day")) {
      arr.push(d);
      d = d.add(1, "day");
    }
    return arr;
  }, [startOfGrid, endOfGrid]);

  // ========== Group cards by YYYY-MM-DD ==========
  const cardsByDate = useMemo(() => {
    const grouped = {};
    for (const card of cards) {
      if (!card?.due_date) continue;

      if (typeof card.due_date !== 'string' || card.due_date.length < 10) continue;
      const dateStr = card.due_date.slice(0, 10);

      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(card);
    }    return grouped;
  }, [cards]);

  // ========== Navigation handler ==========
  const handleNavigateToDay = (e, date) => {
    e.stopPropagation();
    goToDate(date);
    setView("week");
  };

  return (
    <CalendarGrid>
      {days.map((date) => {
        const key = date.format("YYYY-MM-DD");
        const arr = cardsByDate[key] || [];

        const visible = arr.slice(0, MAX_CARDS_DISPLAY);
        const hiddenCount = arr.length - visible.length;

        return (
          <Droppable key={key} droppableId={key} type="CARD">
            {(provided, snapshot) => (
              <DayCell
                date={date}
                cards={visible}
                hiddenCount={hiddenCount}
                isToday={date.isSame(dayjs(), "day")}
                isCurrentMonth={date.isSame(currentDate, 'month')}                
                provided={provided}
                snapshot={snapshot}
                onCardClick={onCardClick}
                handleNavigateToDay={handleNavigateToDay}
              />
            )}
          </Droppable>
        );
      })}
    </CalendarGrid>
  );
}

export default memo(MonthCalendar);

// =========================
// STYLES
// =========================

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  grid-auto-rows: 1fr;
  height: 100%;
`;

const CellWrapper = styled.div`
  background: ${({ $isDraggingOver }) =>
    $isDraggingOver ? "rgba(59,130,246,0.12)" : "var(--surface-2, #1e293b)"};
  border: 1px solid #2b3342;
  border-radius: 10px;
  padding: 8px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: 0.2s ease;

  ${({ $isToday }) => $isToday && `box-shadow: 0 0 0 2px #3b82f6;`}
  ${({ $isCurrentMonth }) => !$isCurrentMonth && `opacity: 0.4;`}
`;

const DayHeader = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 6px;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const StyledCardItem = styled.div`
  padding: 6px 8px;
  background: ${({ $isDragging }) =>
    $isDragging
      ? "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)"
      : "var(--surface-3, #2c3341)"};
  border-radius: 6px;
  font-size: 12px;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  }
`;

const ShowMoreBtn = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
`;
