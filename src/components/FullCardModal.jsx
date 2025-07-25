// FullCardModal.jsx
import React, { useState } from 'react';
import styled from 'styled-components';

export default function FullCardModal({ card, onClose }) {
  const [title, setTitle] = useState(card.text);
  const [description, setDescription] = useState(card.description || '');
  const [editingDescription, setEditingDescription] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { text: newComment, author: 'You', time: 'just now' }]);
      setNewComment('');
    }
  };

  return (
    <Overlay>
      <Modal>
        <LeftColumn>
          <HeaderSection>
            <TitleInput value={title} onChange={(e) => setTitle(e.target.value)} />
            <ButtonRow>
              <ActionButton>+ Add</ActionButton>
              <ActionButton>📅 Dates</ActionButton>
              <ActionButton>☑️ Checklist</ActionButton>
              <ActionButton>📎 Attachment</ActionButton>
            </ButtonRow>
          </HeaderSection>

          <DescriptionSection>
            <Label>Description</Label>
            {editingDescription ? (
              <div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description…"
                />
                <ButtonRow>
                  <BlueButton onClick={() => setEditingDescription(false)}>Save</BlueButton>
                  <CancelButton onClick={() => setEditingDescription(false)}>Cancel</CancelButton>
                </ButtonRow>
              </div>
            ) : (
              <DescriptionRow>
                <DescriptionPreview>{description || 'No description yet'}</DescriptionPreview>
                <EditButton onClick={() => setEditingDescription(true)}>Edit</EditButton>
              </DescriptionRow>
            )}
          </DescriptionSection>
        </LeftColumn>

        <RightColumn>
          <CommentPanel>
            <Section>
              <Label>Comments and activity</Label>
              <CommentInput>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment…"
                />
                <ButtonRow>
                  <BlueButton disabled={!newComment.trim()} onClick={handleAddComment}>
                    Save
                  </BlueButton>
                  <WatchBox>
                    <input type="checkbox" defaultChecked /> Watch
                  </WatchBox>
                </ButtonRow>
              </CommentInput>

              {comments.map((cmt, idx) => (
                <Comment key={idx}>
                  <strong>{cmt.author}</strong> {cmt.text}
                  <Time>{cmt.time}</Time>
                </Comment>
              ))}
</Section>
          </CommentPanel>
        </RightColumn>

        <CloseBtn onClick={onClose}>✖</CloseBtn>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: start;
  padding-top: 40px;
  z-index: 9999;
`;

const Modal = styled.div`
  background: white;
  width: 960px;
  border-radius: 12px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  gap: 32px;
  position: relative;
  padding: 0;
`;

const LeftColumn = styled.div`
  flex: 2;
`;

const RightColumn = styled.div`
  flex: 1;
`;

const HeaderSection = styled.div`
  padding: 24px 20px 16px 32px;
`;

const DescriptionSection = styled.div`
  padding: 0 40px 16px 20px;
`;

const CommentPanel = styled.div`
  padding: 16px;
`;

const TitleInput = styled.textarea`
  font-size: 20px;
  font-weight: 600;
  width: 100%;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  padding: 0;
  margin: 0;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const Section = styled.div`
  margin-top: 24px;
`;

const Label = styled.h4`
  font-size: 14px;
  margin-bottom: 8px;
`;

const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
`;

const DescriptionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const DescriptionPreview = styled.div`
  background: #f4f5f7;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  flex: 1;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: #0c66e4;
  font-size: 14px;
  cursor: pointer;
  margin-left: 8px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
  align-items: center;
`;

const BlueButton = styled.button`
  background: #0c66e4;
  color: white;
  border: none;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background: #a0c4f6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: #5e6c84;
  font-size: 14px;
  cursor: pointer;
`;

const CommentInput = styled.div`
  margin-top: 8px;
`;

const Comment = styled.div`
  background: #fafbfc;
  padding: 8px;
  border-radius: 6px;
  margin-top: 10px;
`;

const WatchBox = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #172b4d;
`;

const Time = styled.div`
  font-size: 12px;
  color: #6b778c;
  margin-top: 4px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #dcdfe4;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #f4f5f7;
  }
`;