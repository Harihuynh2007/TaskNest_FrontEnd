import styled from 'styled-components';

export const PaneWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${({ $background }) => $background || 'var(--color-bg-dark)'};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const InnerContent = styled.div`
  position: relative;
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 120px;
  
  /* ⭐ THÊM: Center content horizontally */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* ⭐ MỚI: Wrapper để constraint width */
export const ContentConstraint = styled.div`
  width: 100%;
  max-width: 760px; /* ⭐ Trello inbox width ~760px */
  
  @media (max-width: 900px) {
    max-width: 100%;
  }
`;

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px; /* ⭐ Giảm từ 8px → 6px cho compact */
  margin-top: 12px;
  transition: background-color 0.2s ease;
  background-color: ${({ $isDraggingOver }) =>
    $isDraggingOver ? 'rgba(59,130,246,0.06)' : 'transparent'};
  
  /* ⭐ THÊM: Max width cho card list */
  width: 100%;
  max-width: 100%; /* Inherit từ ContentConstraint */
`;

export const DraggableCardWrapper = styled.div`
  width: 100%; /* ⭐ 100% của CardList (bị constraint bởi ContentConstraint) */
  background: ${({ $isDragging }) =>
    $isDragging
      ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
      : 'rgba(31, 41, 55, 0.85)'}; /* ⭐ Sửa var thành rgba cụ thể */
  border-radius: 8px; /* ⭐ Giảm từ 10px → 8px */
  box-shadow: ${({ $isDragging }) =>
    $isDragging
      ? '0 8px 20px rgba(59,130,246,0.35)'
      : '0 1px 2px rgba(0,0,0,0.12)'}; /* ⭐ Shadow nhẹ hơn */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
  /* ⭐ THÊM: Hover effect khi không drag */
  &:hover:not(:active) {
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
`;

export const DarkOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 50;
`;

export const CardInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  background: rgba(31, 41, 55, 0.85); /* ⭐ Sửa var thành rgba */
  border-radius: 8px; /* ⭐ Giảm từ 10px → 8px */
  padding: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  width: 100%; /* ⭐ THÊM: Full width trong constraint */
`;

export const Input = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  font-size: 14px; /* ⭐ Giảm từ 15px → 14px */
  padding: 8px;
  border-radius: 6px;
  outline: none;
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px; /* ⭐ Giảm từ 10px → 8px */
  justify-content: flex-start;
`;

export const AddButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-weight: 500;
  font-size: 13px; /* ⭐ Giảm từ 14px → 13px */
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: background 0.2s ease, transform 0.15s ease;
  &:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    transform: translateY(-1px);
  }
`;

export const CancelButton = styled.button`
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px; /* ⭐ Giảm từ 14px → 13px */
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export const AddCardTrigger = styled.div`
  color: rgba(255, 255, 255, 0.75);
  margin-top: 12px;
  font-size: 14px; /* ⭐ Giảm từ 15px → 14px */
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 8px 12px; /* ⭐ THÊM: Padding cho dễ click */
  border-radius: 6px;
  width: 100%; /* ⭐ Full width trong constraint */
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }
`;