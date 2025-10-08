import React, {useState} from 'react';
import styled from 'styled-components';
import BoardSubHeaderLeft from './BoardSubHeaderLeft';
import BoardSubHeaderRight from './BoardSubHeaderRight';

import ShareBoardPopup from './member/ShareBoardPopup';

export default function BoardSubHeader({ boardName = 'Untitled Board',
  setBoardName,
  onRenameBoard,
  setShowFilter,
  filterButtonRef,
  onOpenInvite,
  onCloseBoard  
}) {
  
  const [isStarred, setIsStarred] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleStar = () => {
    setIsStarred(prevIsStarred => !prevIsStarred);
    console.log(isStarred? 'Bỏ đánh dấu sao' : 'Đã đánh dấu sao');
  }
  
  const handleBlur = () => {
    setIsEditing(false);
    if (onRenameBoard) onRenameBoard(); // gọi API updateBoard trong BoardPane
  };
  
  return (
    <HeaderContainer>
      <InnerWrapper>
        <LeftSpan>
          {isEditing ? (
            <BoardNameInput
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleBlur();
                }
              }}
              autoFocus
            />
          ) : (
            <BoardNameText onClick={() => setIsEditing(true)}>
              {boardName}
            </BoardNameText>
          )}
        </LeftSpan>


        <RightSpan>
          <BoardSubHeaderRight 
          setShowFilter={setShowFilter} 
          filterButtonRef={filterButtonRef}
          onOpenInvite={onOpenInvite}
          onCloseBoard={onCloseBoard}
          isStarred={isStarred}
          onToggleStar={handleToggleStar}
           />
          
        </RightSpan>
      </InnerWrapper>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  justify-content: space-between;
  gap: 12px;
`;

const LeftSpan = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
`;

const RightSpan = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const BoardNameText = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #172b4d;
  cursor: pointer;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BoardNameInput = styled.input`
  font-size: 18px;
  font-weight: 700;
  color: #172b4d;
  border: none;
  outline: 2px solid #4c9aff;
  border-radius: 4px;
  padding: 4px 6px;
  width: 200px;
`;
