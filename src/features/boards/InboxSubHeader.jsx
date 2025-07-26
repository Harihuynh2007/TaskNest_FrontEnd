// src/features/boards/InboxSubHeader.jsx
import React from 'react';
import styled from 'styled-components';
import { MdOutlineFeedback, MdFilterList, MdMoreHoriz, MdInbox  } from 'react-icons/md';

export default function InboxSubHeader() {
  return (
    <HeaderWrapper>
      <Wrapper>
        <Left>
          <MdInbox size={20} style={{ marginRight: 6 }} />
          <Title>Inbox</Title>
        </Left>
        <Right>
          <IconButton title="Feedback">
            <MdOutlineFeedback size={20} />
          </IconButton>
          <IconButton title="Filter">
            <MdFilterList size={20} />
          </IconButton>
          <IconButton title="More options">
            <MdMoreHoriz size={24} />
          </IconButton>
        </Right>
      </Wrapper>
    </HeaderWrapper>
  );
}

const HeaderWrapper = styled.h2`
  width: 100vw;
  height: 56px;
  margin: 0;
  background: #f4f5f7;
  border-bottom: 1px solid #dcdfe4;
  display: flex;
  align-items: center;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
`

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  margin : 12px 8px 12px 16px;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;

  &:hover ${Right} {
    opacity: 1;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  color: #172b4d;
`;

const Title = styled.span`
  font-size: 16px;
  font-weight: 600;
`;


const IconButton = styled.button`
  background: none;
  border: none;
  color: #5e6c84;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;

  &:hover {
    color: #172b4d;
  }
`
