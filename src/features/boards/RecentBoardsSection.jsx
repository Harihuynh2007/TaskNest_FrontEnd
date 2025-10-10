// src/features/boards/RecentBoardsSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Clock } from 'lucide-react';

export default function RecentBoardsSection({ recentBoards, loading }) {
  if (loading) {
    return (
      <Section>
        <SectionHeader>
          <Clock size={20} />
          <SectionTitle>Recently viewed</SectionTitle>
        </SectionHeader>
        <SkeletonGrid>
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} />
          ))}
        </SkeletonGrid>
      </Section>
    );
  }

  if (!recentBoards || recentBoards.length === 0) {
    return null; 
  }

  return (
    <Section>
      <SectionHeader>
        <Clock size={20} strokeWidth={2.5} />
        <SectionTitle>Recently viewed</SectionTitle>
      </SectionHeader>
      
      <BoardGrid>
        {recentBoards.slice(0, 8).map(board => (
          <Link
            key={board.id}
            to={`/workspaces/${board.workspaceId}/boards/${board.id}/inbox`}
            style={{ textDecoration: 'none' }}
          >
            <RecentBoardCard
              $background={board.background}
              title={board.name}
            >
              <CardOverlay>
                <BoardName>{board.name}</BoardName>
                {board.workspaceName && (
                  <WorkspaceBadge>{board.workspaceName}</WorkspaceBadge>
                )}
              </CardOverlay>
            </RecentBoardCard>
          </Link>
        ))}
      </BoardGrid>
    </Section>
  );
}

// Styled Components
const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  color: var(--text-secondary, #8a93a2);
`;

const SectionTitle = styled.h6`
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.5px;
  margin: 0;
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
`;

const RecentBoardCard = styled.div`
  position: relative; height: 96px; border-radius: 8px;
  background: ${p => p.$background || 'var(--surface-2, #222834)'};
  background-size: cover; background-position: center; cursor: pointer; transition: all .2s; overflow: hidden;
  &::before{
    content:''; position:absolute; inset:0;
    background: linear-gradient(to bottom, rgba(0,0,0,.1) 0%, rgba(0,0,0,.45) 100%);
    opacity:0; transition: opacity .2s;
  }
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,.24); &::before{opacity:1;} }
`;


const CardOverlay = styled.div`
  position: absolute;
  inset: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
  z-index: 1;
`;

const BoardName = styled.div`
  color: var(--text-primary, #e1e3e6); background: rgba(0,0,0,.45);
  backdrop-filter: blur(4px); padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 16px;
`;


const WorkspaceBadge = styled.div`
  color: var(--text-secondary, #8a93a2); background: rgba(0,0,0,.35);
  backdrop-filter: blur(4px); padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .3px; max-width: fit-content;
`;


// Skeleton Loading
const SkeletonGrid = styled(BoardGrid)``;

const SkeletonCard = styled.div`
  height: 96px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;