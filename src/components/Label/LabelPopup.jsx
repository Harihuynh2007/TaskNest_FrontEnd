import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaPen } from 'react-icons/fa';

export default function LabelPopup({
  anchorRect,
  labels = [],
  selectedLabelIds = [],
  onToggleLabel,
  onCreateLabel,
  onEditLabel,
  onClose,
  boardId, // Thêm boardId để truyền vào CreateLabelModal
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

  const filteredLabels = labels.filter(label =>
    label.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Wrapper
      ref={popupRef}
      style={{
        top: (anchorRect?.bottom || 0) + window.scrollY + 8,
        left: Math.min(anchorRect?.left || 0, window.innerWidth - 280),
      }}
    >
      <Header>
        <Title>Labels</Title>
        <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</CloseBtn>
      </Header>

      <SearchInput
        type="text"
        placeholder="Search labels..."
        value={search}
        onChange={(e) => { e.stopPropagation(); setSearch(e.target.value); }}
      />

      <LabelList>
        {filteredLabels.map((label) => (
          <LabelItem key={label.id}>
            <input
              type="checkbox"
              checked={selectedLabelIds.includes(label.id)}
              onChange={(e) => {
                e.stopPropagation();
                onToggleLabel(label.id);
              }}
            />
            <LabelColor color={label.color}>{label.name}</LabelColor>
            <EditBtn onClick={(e) => { e.stopPropagation(); onEditLabel(label); }}><FaPen size={12} /></EditBtn>
          </LabelItem>
        ))}
      </LabelList>

      <CreateBtn onClick={(e) => { e.stopPropagation(); onCreateLabel(boardId); }}>
        + Create a new label
      </CreateBtn>
    </Wrapper>
  );
}

// (Styled components giữ nguyên, chỉ tăng z-index nếu cần)
const Wrapper = styled.div`
  position: absolute;
  width: 260px;
  background: white;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  z-index: 2200; // Tăng z-index để tránh bị che
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.h4`
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f1f2f4;
  }

  input {
    margin: 0;
  }
`;

const LabelColor = styled.div`
  background-color: ${({ color }) => color};
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  flex: 1;
`;

const EditBtn = styled.button`
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
  color: #6b778c;
`;

const CreateBtn = styled.button`
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