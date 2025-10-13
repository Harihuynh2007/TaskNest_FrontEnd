import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import BoardSubHeaderRight from './BoardSubHeaderRight';

export default function BoardSubHeader({
  boardName = 'Untitled Board',
  setBoardName,
  onRenameBoard,
  setShowFilter,
  filterButtonRef,
  onOpenInvite,
  onCloseBoard
}) {
  const [isStarred, setIsStarred] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [prevName, setPrevName] = useState(boardName);

  const startEditing = () => {
    setPrevName(boardName);
    setIsEditing(true);
  };

  const commitIfChanged = () => {
    setIsEditing(false);
    const oldVal = (prevName || '').trim();
    const newVal = (boardName || '').trim();
    if (!newVal) {                    // chặn rỗng
      setBoardName(prevName);
      return;
    }
    if (newVal !== oldVal) {
      onRenameBoard?.();              // parent đọc boardName hiện tại
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitIfChanged(); }
    if (e.key === 'Escape') { setBoardName(prevName); setIsEditing(false); }
  };

  const handleToggleStar = () => {
    setIsStarred(prevIsStarred => !prevIsStarred);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onRenameBoard) onRenameBoard();
  };

  return (
    <HeaderContainer>
      <InnerWrapper>
        <LeftSection>
          {isEditing ? (
            <BoardNameInput
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              maxLength={100}
            />
          ) : (
            <BoardNameText 
            tabIndex={0}
            onClick={() => setIsEditing(true)} 
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startEditing(); }}
            title="Click to edit"
            >
              {boardName}
            </BoardNameText>
          )}
        </LeftSection>

        <RightSection className="z-pop">
          <BoardSubHeaderRight
            setShowFilter={setShowFilter}
            filterButtonRef={filterButtonRef}
            onOpenInvite={onOpenInvite}
            onCloseBoard={onCloseBoard}
            isStarred={isStarred}
            onToggleStar={handleToggleStar}
          />
        </RightSection>
      </InnerWrapper>
    </HeaderContainer>
  );
}

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;


// ==================== STYLED COMPONENTS ====================
const HeaderContainer = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: ${slideDown} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    backdrop-filter: blur(8px);
  }
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  justify-content: space-between;
  gap: 16px;
  max-width: 100%;

  @media (max-width: 1024px) {
    padding: 10px 12px;
    gap: 12px;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    padding: 8px 10px;
    gap: 8px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;

  @media (max-width: 768px) {
    flex: 1 1 100%;
    gap: 8px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex: 1 1 100%;
    justify-content: flex-start;
  }
`;

const BoardNameText = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #172b4d;
  cursor: pointer;
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(2px);
    
    &::before {
      opacity: 1;
      animation: ${shimmer} 2s infinite;
    }
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 1024px) {
    font-size: 16px;
    max-width: 300px;
    padding: 6px 10px;
  }

  @media (max-width: 768px) {
    font-size: 15px;
    max-width: 200px;
    padding: 6px 8px;
  }
`;

const BoardNameInput = styled.input`
  font-size: 18px;
  font-weight: 700;
  color: #172b4d;
  border: none;
  outline: none;
  border-radius: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 
    0 0 0 3px rgba(40, 167, 69, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${fadeIn} 0.2s ease-out;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  max-width: 400px;

  &:focus {
    box-shadow: 
      0 0 0 3px rgba(40, 167, 69, 0.5),
      0 6px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  &::selection {
    background: rgba(40, 167, 69, 0.3);
  }

  @media (max-width: 1024px) {
    font-size: 16px;
    max-width: 300px;
    padding: 6px 10px;
  }

  @media (max-width: 768px) {
    font-size: 15px;
    max-width: 200px;
    padding: 6px 8px;
  }
`;