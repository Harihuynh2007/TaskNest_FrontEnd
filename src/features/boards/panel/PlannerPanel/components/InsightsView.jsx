import React, { useMemo } from "react";
import styled from "styled-components";
import dayjs from "dayjs";

export default function InsightsView({ currentDate, cards, onSmartReschedule }) {
  const today = currentDate.startOf("day");

  const stats = useMemo(() => {
    const total = cards.length;
    const completed = cards.filter((c) => c.completed).length;

    const overdue = cards.filter((c) => {
      if (!c.due_date || c.completed) return false;
      const d = dayjs(c.due_date).startOf("day");
      return d.isBefore(today, "day");
    }).length;

    const upcomingWeek = cards.filter((c) => {
      if (!c.due_date) return false;
      const d = dayjs(c.due_date).startOf("day");
      return d.isSame(today, "day") || d.isBefore(today.add(7, "day")) && d.isAfter(today.subtract(1, "day"));
    }).length;

    const byList = {};
    cards.forEach((c) => {
      const key = c.listName || "Inbox";
      if (!byList[key]) byList[key] = 0;
      byList[key] += 1;
    });

    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      overdue,
      upcomingWeek,
      completionRate,
      byList,
    };
  }, [cards, today]);

  const listEntries = Object.entries(stats.byList).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <Wrapper>
      <CardsRow>
        <InsightCard>
          <Label>Completion Rate</Label>
          <BigNumber>{stats.completionRate}%</BigNumber>
          <SubLabel>
            {stats.completed}/{stats.total} cards completed
          </SubLabel>
          <ProgressBar>
            <ProgressFill style={{ width: `${stats.completionRate}%` }} />
          </ProgressBar>
        </InsightCard>

        <InsightCard>
          <Label>Overdue</Label>
          <BigNumber $danger>{stats.overdue}</BigNumber>
          <SubLabel>Tasks past due date</SubLabel>
        </InsightCard>

        <InsightCard>
          <Label>Upcoming 7 days</Label>
          <BigNumber>{stats.upcomingWeek}</BigNumber>
          <SubLabel>Due within next week</SubLabel>
        </InsightCard>
      </CardsRow>

      <CardsRow>
        <InsightCard>
          <Label>Workload by List</Label>
          <ListDistribution>
            {listEntries.length === 0 && (
              <EmptyText>No cards yet.</EmptyText>
            )}
            {listEntries.map(([name, count]) => (
              <ListRow key={name}>
                <span>{name}</span>
                <ListBarWrapper>
                  <ListBar
                    style={{
                      width:
                        stats.total > 0
                          ? `${(count / stats.total) * 100}%`
                          : "0%",
                    }}
                  />
                </ListBarWrapper>
                <ListCount>{count}</ListCount>
              </ListRow>
            ))}
          </ListDistribution>
        </InsightCard>

        <InsightCard>
          <Label>Smart Reschedule</Label>
          <SubLabel>
            Automatically spread overdue tasks over the next days.
          </SubLabel>
          <SmartBox>
            <SmartDescription>
              Overdue tasks: <strong>{stats.overdue}</strong>
            </SmartDescription>
            <SmartButton
              type="button"
              onClick={onSmartReschedule}
              disabled={stats.overdue === 0}
            >
              Run Smart Reschedule
            </SmartButton>
            <SmallHint>
              We will keep tasks in the same board, only shifting due dates.
            </SmallHint>
          </SmartBox>
        </InsightCard>
      </CardsRow>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CardsRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;

  &:last-child {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  }

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const InsightCard = styled.div`
  border-radius: 14px;
  background: radial-gradient(circle at top left, #0b1120 0, #020617 60%);
  border: 1px solid rgba(30, 64, 175, 0.75);
  padding: 14px 16px;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.6);
`;

const Label = styled.div`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 4px;
`;

const BigNumber = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: ${({ $danger }) => ($danger ? "#f97373" : "#e5e7eb")};
`;

const SubLabel = styled.div`
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
`;

const ProgressBar = styled.div`
  margin-top: 8px;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: #1f2933;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4ade80);
`;

const ListDistribution = styled.div`
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ListRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  color: #e5e7eb;
`;

const ListBarWrapper = styled.div`
  height: 5px;
  border-radius: 999px;
  background: #020617;
  overflow: hidden;
`;

const ListBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
`;

const ListCount = styled.span`
  font-size: 11px;
  color: #9ca3af;
`;

const EmptyText = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const SmartBox = styled.div`
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(51, 65, 85, 0.85);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SmartDescription = styled.div`
  font-size: 13px;
  color: #e5e7eb;
`;

const SmartButton = styled.button`
  align-self: flex-start;
  padding: 6px 12px;
  border-radius: 999px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: #fff;
  transition: 0.15s ease;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.6);
  }
`;

const SmallHint = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;
