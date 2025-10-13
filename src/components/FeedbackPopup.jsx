// src/features/boards/FeedbackPopup.jsx
import React from 'react';
import styled from 'styled-components';

export default function FeedbackPopup({ onClose }) {
  return (
    <PopupContainer>
      <PopupHeader>
        <span>Feedback</span>
        <CloseButton onClick={onClose}>×</CloseButton>
      </PopupHeader>
      <PopupBody>
        <textarea placeholder="Tell us what you think..." />
        <SubmitButton>Send</SubmitButton>
      </PopupBody>
    </PopupContainer>
  );
}

const PopupContainer = styled.div`
  position: absolute;
  top: 60px;
  right: 16px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 12px;
  width: 320px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;

const PopupBody = styled.div`
  display: flex;
  flex-direction: column;

  textarea {
    resize: none;
    height: 80px;
    padding: 8px;
    font-size: 14px;
    border-radius: 4px;
    border: 1px solid #ccc;
    margin-bottom: 8px;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  align-self: flex-end;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: transform 0.2s ease;
  &:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
`;



