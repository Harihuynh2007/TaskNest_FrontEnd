import React from 'react';
import styled from 'styled-components';
import ActivityList from '../activity/ActivityList'; // giữ nguyên đường dẫn hiện có

export default function CardActivity({ activities = [], loading }) {
  return (
    <Section>
      <SectionHeader>Activity</SectionHeader>

      {loading ? (
        <LoadingText>Loading activity…</LoadingText>
      ) : (
        <List>
          {activities?.length ? (
            activities.map((act) => (
              <ActivityList key={act.id ?? `${act.type}-${act.created_at}`} activity={act} />
            ))
          ) : (
            <Empty>There’s no activity yet.</Empty>
          )}
        </List>
      )}
    </Section>
  );
}

/* --- Styled: giữ nguyên tinh thần cũ để no-visual-diff --- */
const Section = styled.div`
  margin-top: 16px;
  margin-bottom: 24px;
`;
const SectionHeader = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  margin: 0 0 8px 0;
`;
const LoadingText = styled.div`
  color: #6b778c;
  font-style: italic;
  padding: 8px 0;
`;
const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const Empty = styled.div`
  color: #6b778c;
  font-style: italic;
`;
