// src/components/Card/Due/InlineDateBlock.styles.js
import styled from 'styled-components';

/* ========== Container ========== */
export const Container = styled.div`
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 6px;
  color: #e5e7eb;
  font-size: 12px;
  margin: 4px 0;
`;

/* ========== DateTrigger (main button) ========== */
export const DateTrigger = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.25);
  background: rgba(31, 41, 55, 0.8);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
  outline: none;
  width: fit-content;
  max-width: 100%;
  flex-shrink: 0;

  position: relative;
  isolation: isolate; 
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    opacity: 0;
    transition: opacity 0.25s ease;
    will-change: transform;
    z-index: -1;
  }

  &:hover:before,
  &:focus-visible:before {
    opacity: 1;
  }

  &:hover,
  &:focus-visible {
    color: #fff;
    box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
    border-color: rgba(59, 130, 246, 0.4);
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
    
  }
`;

/* ========== StatusBadge (Active / Overdue) ========== */
export const StatusBadge = styled.span`
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid
    ${({ status }) =>
      status === 'Overdue'
        ? 'rgba(239,68,68,0.35)'
        : 'rgba(59,130,246,0.25)'};
  background: ${({ status }) =>
    status === 'Overdue'
      ? 'rgba(239,68,68,0.12)'
      : 'rgba(59,130,246,0.15)'};
  color: ${({ status }) =>
    status === 'Overdue' ? '#f87171' : '#60a5fa'};
  box-shadow: ${({ status }) =>
    status === 'Overdue'
      ? '0 0 4px rgba(239,68,68,0.25)'
      : '0 0 4px rgba(59,130,246,0.25)'};
`;

/* ========== SavedIndicator ========== */
export const SavedIndicator = styled.div`
  font-size: 11px;
  color: #22c55e;
  font-weight: 500;
  margin-left: 6px;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;
