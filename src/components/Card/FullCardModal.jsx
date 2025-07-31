import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BiLabel } from 'react-icons/bi';
import { BsClock } from 'react-icons/bs';
import { HiOutlineUserAdd } from 'react-icons/hi';
import { MdChecklist } from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import { IoChevronDown } from 'react-icons/io5';

export default function FullCardModal({ card, onClose }) {
  const [title, setTitle] = useState(card.name || card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { text: newComment, author: 'You', time: 'just now' }]);
      setNewComment('');
    }
  };
  useEffect(() => {
    setTitle(card.name || card.title || '');
  }, [card]);


  return (
    <Overlay>
      <ModalContainer>
        <HeaderBar>
          <HeaderLeft>
            <TitleButton aria-label="Open card menu">
              <CardTitle>{title}</CardTitle>
              <DropIcon aria-hidden="true">
                <IoChevronDown size={20} />
              </DropIcon>
            </TitleButton>
          </HeaderLeft>
          <HeaderRight>
            <IconBtn title="Feedback" aria-label="Feedback">📢</IconBtn>
            <IconBtn title="Cover" aria-label="Cover">🖼️</IconBtn>
            <IconBtn title="Actions" aria-label="Actions">⋯</IconBtn>
            <CloseBtn onClick={onClose} aria-label="Close">
              <IoCloseOutline size={24} />
            </CloseBtn>
          </HeaderRight>
        </HeaderBar>

        <ContentBody>
          <MainColumn>
            <ActionsRow>
              <ActionButton><span>+ Add</span></ActionButton>
              <ActionButton><BiLabel /> Labels</ActionButton>
              <ActionButton><BsClock /> Dates</ActionButton>
              <ActionButton><MdChecklist /> Checklist</ActionButton>
              <ActionButton><HiOutlineUserAdd /> Members</ActionButton>
            </ActionsRow>

            <Section>
              <SectionLabel>Description</SectionLabel>
              <DescriptionBox
                placeholder="Add a more detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Section>
          </MainColumn>

          <Sidebar>
            <Section>
              <SectionLabel>Comments and activity</SectionLabel>
              <CommentInput
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <CommentList>
                {comments.map((c, i) => (
                  <Comment key={i}>
                    <strong>{c.author}</strong> {c.text}
                    <Time>{c.time}</Time>
                  </Comment>
                ))}
                <Comment>
                  <strong>Hải Huỳnh</strong> added this card to Inbox
                  <Time>Jul 27, 2025, 12:42 PM</Time>
                </Comment>
              </CommentList>
            </Section>
          </Sidebar>
        </ContentBody>
      </ModalContainer>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(9, 30, 66, 0.48);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 48px;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 960px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 8px 12px rgba(9, 30, 66, 0.15), 0 0 1px rgba(9, 30, 66, 0.3);
`;

const HeaderBar = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #dfe1e6;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const TitleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  color: #172b4d;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background-color: #f1f2f4;
  }
`;


const CardTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DropIcon = styled.span`
  font-size: 18px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
`;

const ContentBody = styled.div`
  display: flex;
  flex-direction: row;
`;

const MainColumn = styled.div`
  flex: 2;
  padding: 24px 20px 16px;
`;

const Sidebar = styled.div`
  flex: 1;
  padding: 24px 20px;
  border-left: 1px solid #dfe1e6;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f4f5f7;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #e9f2ff;
  }
`;

const Section = styled.div`
  margin-top: 12px;
`;

const SectionLabel = styled.h4`
  font-size: 14px;
  margin-bottom: 8px;
`;

const DescriptionBox = styled.textarea`
  width: 100%;
  min-height: 80px;
  border: 1px solid #dfe1e6;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  resize: vertical;
`;

const CommentInput = styled.textarea`
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  margin-bottom: 12px;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Comment = styled.div`
  background: #fafbfc;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
`;

const Time = styled.div`
  font-size: 12px;
  color: #6b778c;
  margin-top: 4px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #172b4d;
`;