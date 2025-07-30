// LabelPopup.jsx – giống Trello, có ô tick chọn label trực tiếp
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaPen } from 'react-icons/fa';
import { IoMdCheckmark } from 'react-icons/io';

const DEFAULT_LABELS = [
  { id: 'green', color: '#61bd4f', name: '' },
  { id: 'yellow', color: '#f2d600', name: '' },
  { id: 'orange', color: '#ff9f1a', name: '' },
  { id: 'red', color: '#eb5a46', name: '' },
  { id: 'purple', color: '#c377e0', name: '' },
  { id: 'blue', color: '#0079bf', name: '' },
];

export default function LabelPopup({
  anchorRect,
  labels = [],
  selectedLabelIds = [],
  onToggleLabel,
  onCreateLabel,
  onEditLabel,
  onClose,
  boardId,
}) {
  const popupRef = useRef();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const allLabels = labels.length === 0 ? DEFAULT_LABELS : labels;
  const filteredLabels = allLabels.filter((label) =>
    label.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Wrapper
      ref={popupRef}
      style={{
        top: (anchorRect?.bottom || 0) + window.scrollY + 8,
        left: Math.min(anchorRect?.left || 0, window.innerWidth - 280),
      }}
      role="dialog"
      aria-labelledby="label-popup-title"
    >
      <Header>
        <Title id="label-popup-title">Labels</Title>
        <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Close">✕</CloseBtn>
      </Header>

      <SearchInput
        type="text"
        placeholder="Search labels…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search labels"
      />

      <LabelList>
        {filteredLabels.map((label) => {
          const isSelected = selectedLabelIds.includes(label.id);
          return (
            <LabelItem key={label.id}>
              <StyledLabelDiv onClick={() => onToggleLabel(label.id)}>
                <Checkbox
                  type="checkbox"
                  checked={isSelected}
                  readOnly // ✅ cần thiết nếu không có onChange
                />

                <ColorBlock color={label.color}>
                  <LabelName>{label.name || ''}</LabelName>
                  <EditBtn
                    aria-label={`Edit Color: ${label.color}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      onEditLabel(label, rect);
                    }}
                  >
                    <FaPen />
                  </EditBtn>
                </ColorBlock>
              </StyledLabelDiv>
            </LabelItem>
          );
        })}
      </LabelList>

      <CreateButton onClick={() => onCreateLabel(boardId)}>
        + Create a new label
      </CreateButton>
    </Wrapper>
  );
}

const StyledLabelDiv = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
`;


const Wrapper = styled.div`
  position: absolute;
  width: 260px;
  background: white;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  z-index: 2200;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.h2`
  font-size: 16px;
  margin: 0;
`;

const CloseBtn = styled.button`
  border: none;
  background: none;
  font-size: 16px;
  cursor: pointer;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  margin-bottom: 10px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const LabelList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  max-height: 200px;
  overflow-y: auto;
`;

const LabelItem = styled.li`
  margin-bottom: 6px;
`;

const StyledLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const ColorBlock = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ color }) => color};
  border-radius: 4px;
  padding: 6px 10px;
  color: var(--ds-text-inverse);
  font-size: 13px;
  font-weight: 500;
  &:hover {
    filter: brightness(1.05);
  }
  &:active {
    filter: brightness(0.95);
  }
`;

const LabelName = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const EditBtn = styled.button`
  background: none;
  border: none;
  color: white;
  opacity: 0.7;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
`;

const CreateButton = styled.button`
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background: #f4f5f7;
  cursor: pointer;
  &:hover {
    background: #e9f2ff;
  }
`;
