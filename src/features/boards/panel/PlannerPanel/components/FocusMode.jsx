import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import dayjs from "dayjs";

export default function FocusMode({
  currentDate,
  cards,
  onCardClick,
  onToggleComplete,
}) {
  const today = currentDate.startOf("day");

  // Lưu Focus Queue theo localStorage
  const [focusIds, setFocusIds] = useState(() => {
    try {
      const raw = localStorage.getItem("planner_focus_queue");
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(arr);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    const arr = Array.from(focusIds);
    localStorage.setItem("planner_focus_queue", JSON.stringify(arr));
  }, [focusIds]);

  const toggleFocus = (cardId) => {
    setFocusIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const { todayCards, overdueCards, focusCards } = useMemo(() => {
    const todayArr = [];
    const overdue = [];
    const focus = [];

    cards.forEach((card) => {
      if (!card.due_date) return;
      const d = dayjs(card.due_date).startOf("day");
      if (d.isSame(today, "day")) {
        todayArr.push(card);
      } else if (d.isBefore(today, "day") && !card.completed) {
        overdue.push(card);
      }
      if (focusIds.has(card.id)) {
        focus.push(card);
      }
    });

    return {
      todayCards: todayArr.sort((a, b) => a.id - b.id),
      overdueCards: overdue.sort((a, b) => a.id - b.id),
      focusCards: focus.sort((a, b) => a.id - b.id),
    };
  }, [cards, today, focusIds]);

  const renderCard = (card) => {
    const isFocused = focusIds.has(card.id);
    return (
      <CardRow key={card.id}>
        <CardMain onClick={() => onCardClick(card)}>
          <CardTitle completed={card.completed}>{card.name}</CardTitle>
          {card.due_date && (
            <CardMeta>
              Due {dayjs(card.due_date).format("DD MMM YYYY")}
            </CardMeta>
          )}
        </CardMain>
        <CardActions>
          {typeof onToggleComplete === "function" && (
            <MiniAction
              onClick={() => onToggleComplete(card.id)}
              title="Toggle done"
            >
              {card.completed ? "✓" : "○"}
            </MiniAction>
          )}
          <MiniAction
            data-active={isFocused}
            onClick={() => toggleFocus(card.id)}
          >
            {isFocused ? "Unfocus" : "Focus"}
          </MiniAction>
        </CardActions>
      </CardRow>
    );
  };

  return (
    <FocusWrapper>
      <Section>
        <SectionHeader>
          <SectionTitle>Today</SectionTitle>
          <SectionCount>{todayCards.length}</SectionCount>
        </SectionHeader>
        {todayCards.length === 0 && (
          <EmptyHint>No tasks scheduled for today.</EmptyHint>
        )}
        {todayCards.map(renderCard)}
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Overdue</SectionTitle>
          <SectionCount>{overdueCards.length}</SectionCount>
        </SectionHeader>
        {overdueCards.length === 0 && (
          <EmptyHint>Nice! No overdue tasks.</EmptyHint>
        )}
        {overdueCards.map(renderCard)}
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Focus Queue</SectionTitle>
          <SectionCount>{focusCards.length}</SectionCount>
        </SectionHeader>
        {focusCards.length === 0 && (
          <EmptyHint>
            Use “Focus” on important cards to keep them here.
          </EmptyHint>
        )}
        {focusCards.map(renderCard)}
      </Section>
    </FocusWrapper>
  );
}

const FocusWrapper = styled.div`
  max-width: 880px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Section = styled.section`
  background: rgba(15, 23, 42, 0.85);
  border-radius: 14px;
  border: 1px solid rgba(51, 65, 85, 0.85);
  padding: 14px 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0;
`;

const SectionCount = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
`;

const EmptyHint = styled.div`
  font-size: 13px;
  color: #6b7280;
  padding: 6px 2px;
`;

const CardRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(51, 65, 85, 0.9);
  margin-top: 6px;
  gap: 8px;
  transition: 0.15s ease;
  &:hover {
    background: rgba(30, 64, 175, 0.32);
    border-color: rgba(59, 130, 246, 0.7);
  }
`;

const CardMain = styled.div`
  flex: 1;
  cursor: pointer;
`;

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ completed }) => (completed ? "#94a3b8" : "#e5e7eb")};
  text-decoration: ${({ completed }) => (completed ? "line-through" : "none")};
`;

const CardMeta = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: #9ca3af;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MiniAction = styled.button`
  border: none;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  background: rgba(15, 23, 42, 0.8);
  color: #9ca3af;
  border: 1px solid rgba(51, 65, 85, 0.9);
  transition: 0.15s ease;

  &[data-active="true"] {
    background: rgba(56, 189, 248, 0.16);
    border-color: rgba(56, 189, 248, 0.8);
    color: #e0f2fe;
  }

  &:hover {
    background: rgba(30, 64, 175, 0.3);
    border-color: rgba(59, 130, 246, 0.9);
    color: #e5e7eb;
  }
`;
