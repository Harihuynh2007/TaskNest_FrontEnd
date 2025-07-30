import React from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import PopupWrapper from '../common/PopupWrapper';

const COLORS = [
  '#61bd4f', '#f2d600', '#ff9f1a', '#eb5a46', '#c377e0',
  '#0079bf', '#00c2e0', '#51e898', '#ff78cb', '#344563'
];

export default function LabelCreateView({
  newLabel,
  onBack,
  onClose,
  onChangeTitle,
  onSelectColor,
  onCreate,
}) {
  return (
    <PopupWrapper>
        <Header>
            <IconBtn onClick={onBack}><FaArrowLeft /></IconBtn>
            <Title>Create label</Title>
            <IconBtn onClick={onClose}><FaTimes /></IconBtn>
        </Header>

        <ColorPreview style={{ backgroundColor: newLabel.color || '#ccc' }} />

        <LabelText>Title</LabelText>
        <Input
            type="text"
            value={newLabel.name}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="Enter label title"
        />

        <LabelText>Select a color</LabelText>
        <ColorGrid>
            {COLORS.map((color) => (
            <ColorTile
                key={color}
                color={color}
                isSelected={newLabel.color === color}
                onClick={() => onSelectColor(color)}
            />
            ))}
        </ColorGrid>

        <Footer>
            <CreateBtn onClick={onCreate} disabled={!newLabel.name.trim()}>
                Create
            </CreateBtn>
        </Footer>

    </PopupWrapper>
  );
}

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

const LabelText = styled.label`
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
  border: ${({ isSelected }) => (isSelected ? '2px solid #172b4d' : '1px solid #ccc')};
  cursor: pointer;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CreateBtn = styled.button`
  background-color: #0c66e4;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  line-height: 20px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0055cc;
  }

  &:disabled {
    background-color: #a5c7f9;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

