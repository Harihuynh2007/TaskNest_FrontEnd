import React from 'react';
import styled from 'styled-components';

const COLORS = [
  '#171c26', '#1f2633', '#2c3341', '#3a414f',
  '#4aa8ff', '#7c3aed', '#f43f5e', '#f59e0b',
  '#10b981', '#06b6d4', '#64748b', '#e2e8f0'
];

export default function InboxThemePicker({
  inboxColor,
  previewColor,
  applyPreview,
  clearPreview,
  setInboxColor,
}) {
  return (
    <PickerWrapper>
      <Label>Inbox background</Label>
      <ColorGrid>
        {COLORS.map((color) => {
          const isSelected = color === inboxColor;
          return (
            <ColorBox
              key={color}
              color={color}
              onMouseEnter={() => applyPreview(color)}
              onMouseLeave={clearPreview}
              onClick={() => setInboxColor(color)}
              $selected={isSelected}
            >
              {isSelected && <CheckMark>✓</CheckMark>}
            </ColorBox>
          );
        })}
      </ColorGrid>
    </PickerWrapper>
  );
}

const PickerWrapper = styled.div`
  padding: 12px 16px;
  background: var(--surface-2, #1f2633);
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  margin-bottom: 16px;
`;

const Label = styled.div`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-secondary, #a0aec0);
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 8px;
`;

const ColorBox = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${({ color }) => color};
  cursor: pointer;
  border: ${({ $selected }) => ($selected ? '2px solid #4aa8ff' : '1px solid #2a3342')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.05);
  }
`;

const CheckMark = styled.div`
  color: white;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 3px rgba(0,0,0,0.8);
`;