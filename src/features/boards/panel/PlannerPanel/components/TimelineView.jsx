import React from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import { motion } from "framer-motion";

export default function TimelineView({ currentDate, cards, onCardClick }) {
  const start = currentDate.startOf("week");
  const days = Array.from({ length: 7 }).map((_, i) => start.add(i, "day"));

  return (
    <Wrapper>
      <HeaderRow>
        {days.map((d) => (
          <DayLabel key={d.format("YYYY-MM-DD")}>{d.format("ddd D")}</DayLabel>
        ))}
      </HeaderRow>

      <Body>
        {cards.map((card, idx) => {
          const due = card.due_date ? dayjs(card.due_date) : null;
          if (!due) return null;
          const offset = due.diff(start, "day");
          if (offset < 0 || offset > 6) return null;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <TaskBar
                style={{ gridColumnStart: offset + 1 }}
                onClick={() => onCardClick(card)}
              >
                {card.name}
              </TaskBar>
            </motion.div>
          );
        })}
      </Body>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
`;

const DayLabel = styled.div`
  text-align: center;
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  position: relative;
`;

const TaskBar = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: white;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s ease;
  &:hover {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    transform: translateY(-1px);
  }
`;
