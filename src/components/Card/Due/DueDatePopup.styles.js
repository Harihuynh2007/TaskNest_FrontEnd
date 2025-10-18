// src/components/card/DueDatePopup.styles.js
import styled, { css } from 'styled-components';

export const PopupContainer = styled.div`
  position: fixed;
  z-index: 9999;
  width: 260px;
  background: rgba(17, 24, 39, 0.96);
  backdrop-filter: blur(14px);
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  color: #e5e7eb;
  ${({ anchorRect }) =>
    anchorRect &&
    css`
      top: ${Math.min(anchorRect.bottom + 8, window.innerHeight - 320)}px;
      left: ${Math.min(anchorRect.left, window.innerWidth - 280)}px;
    `}
  @media (max-width: 480px) {
    width: 90vw;
    left: 5vw !important;
  }
  transition: opacity 0.15s ease, transform 0.15s ease;
`;

// Mũi tên nhỏ hướng từ button xuống popup
export const Arrow = styled.div`
  position: absolute;
  top: -7px;
  left: 24px;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid rgba(17, 24, 39, 0.96);
`;

export const PopupHeader = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
  text-align: left;
`;

export const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Label = styled.label`
  font-size: 13px;
  color: #9ca3af;
`;

const inputBase = css`
  background: #111827;
  border: 1px solid #374151;
  color: #e5e7eb;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.15s ease;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

export const DateInput = styled.input`
  ${inputBase};
`;

export const TimeInput = styled.input`
  ${inputBase};
`;

export const Select = styled.select`
  ${inputBase};
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg fill='none' stroke='%239CA3AF' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 14px;
`;

export const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  gap: 8px;
`;

export const SaveButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const RemoveButton = styled(SaveButton)`
  background: #1f2937;
  border: 1px solid #374151;
  &:hover {
    background: #374151;
  }
`;

export const PickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;



