// src/features/boards/FilterPopup.jsx
import React from 'react';
import styled from 'styled-components';

export default function FilterPopup({ onClose }) {
  return (
    <PopupContainer>
      <PopupHeader>
        <span>Filter cards</span>
        <CloseButton onClick={onClose}>×</CloseButton>
      </PopupHeader>
      <PopupBody>
        <label>
          <input type="checkbox" /> Show completed
        </label>
        <label>
          <input type="checkbox" /> Show uncompleted
        </label>
      </PopupBody>
    </PopupContainer>
  );
}

const PopupContainer = styled.div`
  position: absolute;
  top: 60px;
  right: 64px;
  z-index: 1000;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 12px;
  width: 220px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
  gap: 6px;
  font-size: 14px;
`;
