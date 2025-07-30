import React from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

export default function LabelEditView({
  label,
  onBack,
  onClose,
  onChangeTitle,
  onSelectColor,
  onRemoveColor,
  onSave,
  onDelete,
}) {
  const COLORS = [ // bạn có thể đặt trong constants sau
    '#61bd4f', '#f2d600', '#ff9f1a', '#eb5a46', '#c377e0',
    '#0079bf', '#00c2e0', '#51e898', '#ff78cb', '#344563',
  ];

  return (
    <Wrapper>
      <Header>
        <IconBtn onClick={onBack}><FaArrowLeft /></IconBtn>
        <Title>Edit label</Title>
        <IconBtn onClick={onClose}><FaTimes /></IconBtn>
      </Header>

      <ColorPreview style={{ backgroundColor: label.color || '#ccc' }} />

      <Label>Title</Label>
      <Input
        type="text"
        value={label.name}
        onChange={(e) => onChangeTitle(e.target.value)}
        placeholder="Enter label title"
      />

      <Label>Select a color</Label>
      <ColorGrid>
        {COLORS.map((color) => (
          <ColorTile
            key={color}
            color={color}
            isSelected={label.color === color}
            onClick={() => onSelectColor(color)}
          />
        ))}
      </ColorGrid>

      <RemoveBtn onClick={onRemoveColor}>✕ Remove color</RemoveBtn>

      <Footer>
        <SaveBtn onClick={onSave}>Save</SaveBtn>
        <DeleteBtn onClick={onDelete}>Delete</DeleteBtn>
      </Footer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 16px;
  margin: 0;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
`;

const ColorPreview = styled.div`
  height: 32px;
  border-radius: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
`;

const ColorTile = styled.div`
  width: 32px;
  height: 32px;
  background-color: ${({ color }) => color};
  border-radius: 4px;
  border: ${({ isSelected }) => (isSelected ? '2px solid #172b4d' : 'none')};
  cursor: pointer;
`;

const RemoveBtn = styled.button`
  background: #f4f5f7;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const SaveBtn = styled.button`
  background: #0c66e4;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
`;

const DeleteBtn = styled.button`
  background: #eb5a46;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
`;
