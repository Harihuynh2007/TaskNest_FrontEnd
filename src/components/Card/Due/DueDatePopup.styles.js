// src/components/Card/Due/DueDatePopup.styles.js
import styled, { css } from 'styled-components';

/* ===========================
   Container & Layout
   =========================== */
export const PopupContainer = styled.div`
  position: fixed;
  z-index: 9999;
  width: 280px;
  background: rgba(17, 24, 39, 0.96);
  backdrop-filter: blur(14px);
  border-radius: 14px;
  padding: 16px 18px;
  color: #e5e7eb;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(59, 130, 246, 0.15);
  ${({ anchorRect }) =>
    anchorRect &&
    css`
      top: ${Math.min(anchorRect.bottom + 10, window.innerHeight - 340)}px;
      left: ${Math.min(anchorRect.left, window.innerWidth - 300)}px;
    `}
  transition: opacity 0.15s ease, transform 0.15s ease;

  @media (max-width: 480px) {
    width: 92vw;
    left: 4vw !important;
    top: auto;
    bottom: 5vh;
    padding: 14px;
  }
`;

/* Mũi tên chỉ */
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

/* ===========================
   Header & Content
   =========================== */
export const PopupHeader = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
  text-align: left;
  position: relative;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.25);
  box-shadow: 0 1px 0 rgba(6, 182, 212, 0.25);
`;

export const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/* ===========================
   Field Groups
   =========================== */
export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const Label = styled.label`
  font-size: 13px;
  color: #9ca3af;
`;

const inputBase = css`
  background: #111827;
  border: 1px solid #374151;
  color: #e5e7eb;
  padding: 7px 8px;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    border-color: rgba(59, 130, 246, 0.5);
  }

  &:focus {
    outline: none;
    border-color: transparent;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.6),
                0 0 0 4px rgba(6, 182, 212, 0.35);
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
  background-position: right 10px center;
  background-size: 14px;
  cursor: pointer;
`;

/* ===========================
   Quick Buttons
   =========================== */
export const QuickButtonsRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin-top: -4px;
`;

export const QuickBtn = styled.button`
  flex: 1;
  font-size: 12.5px;
  padding: 5px 0;
  border: none;
  border-radius: 6px;
  color: #e5e7eb;
  background: rgba(31, 41, 55, 0.9);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.15) inset;

  &:hover,
  &:focus-visible {
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    color: #fff;
    box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: scale(0.97);
  }
`;

/* ===========================
   Buttons
   =========================== */
export const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  gap: 10px;
`;

export const SaveButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  border: none;
  border-radius: 10px;
  padding: 8px 0;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);

  &:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.5);
  }
`;

export const RemoveButton = styled(SaveButton)`
  background: #1f2937;
  border: 1px solid #374151;
  box-shadow: none;
  &:hover {
    background: #374151;
  }
`;

export const PickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
