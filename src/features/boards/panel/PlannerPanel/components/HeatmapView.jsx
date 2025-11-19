import React, { useMemo } from "react";
import styled from "styled-components";
import dayjs from "dayjs";

export default function HeatmapView({ currentDate, cards }) {
  const days = useMemo(() => {
    const arr = [];
    const end = currentDate.startOf("day");
    // 35 ngày gần nhất (5 tuần) – density D1
    for (let i = 34; i >= 0; i--) {
      const d = end.subtract(i, "day");
      arr.push(d);
    }
    return arr;
  }, [currentDate]);

  const map = useMemo(() => {
    const grouped = {};
    cards.forEach((c) => {
      if (!c.due_date) return;
      const key = dayjs(c.due_date).format("YYYY-MM-DD");
      if (!grouped[key]) grouped[key] = { total: 0, completed: 0 };
      grouped[key].total += 1;
      if (c.completed) grouped[key].completed += 1;
    });
    return grouped;
  }, [cards]);

  const getColor = (count) => {
    if (count === 0) return "#1f2933";
    if (count <= 2) return "#273143";
    if (count <= 4) return "#2d3b50";
    if (count <= 6) return "#37527a";
    return "#58aff6";
  };

  return (
    <Wrapper>
      <Header>
        <Title>Last 5 weeks</Title>
        <Subtitle>Each cell = number of cards by due date</Subtitle>
      </Header>

      <HeatmapGrid>
        {days.map((d, idx) => {
          const key = d.format("YYYY-MM-DD");
          const stats = map[key] || { total: 0, completed: 0 };
          const color = getColor(stats.total);
          const column = Math.floor(idx / 7) + 1;
          const row = (idx % 7) + 1;

          return (
            <CellWrapper
              key={key}
              style={{
                gridColumn: column,
                gridRow: row,
              }}
            >
              <CellDot
                $color={color}
                title={`${key}\n${stats.total} task(s)\n${stats.completed} completed`}
              />
            </CellWrapper>
          );
        })}
      </HeatmapGrid>

      <LegendRow>
        <LegendLabel>Less</LegendLabel>
        <LegendDots>
          <LegendDot $color="#1f2933" />
          <LegendDot $color="#273143" />
          <LegendDot $color="#2d3b50" />
          <LegendDot $color="#37527a" />
          <LegendDot $color="#58aff6" />
        </LegendDots>
        <LegendLabel>More</LegendLabel>
      </LegendRow>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: 12px 8px;
`;

const Header = styled.div`
  margin-bottom: 12px;
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  color: #e5e7eb;
`;

const Subtitle = styled.div`
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
`;

const HeatmapGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-auto-rows: 1fr;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 12px;
  background: radial-gradient(circle at top left, #111827 0, #020617 55%);
  border: 1px solid rgba(30, 64, 175, 0.7);
`;

const CellWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CellDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.9);
  transition: 0.15s ease;
  cursor: default;

  &:hover {
    transform: scale(1.08) translateY(-1px);
    box-shadow: 0 6px 18px rgba(88, 175, 246, 0.35);
  }
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
`;

const LegendLabel = styled.span`
  font-size: 11px;
  color: #9ca3af;
`;

const LegendDots = styled.div`
  display: flex;
  gap: 4px;
`;

const LegendDot = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
`;
