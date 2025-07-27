// CardEditPopup.jsx (chuẩn Trello-style)
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

export default function CardEditPopup({ anchorRect, cardText, onClose, onChange, onSave, onOpenFullCard }) {
  const popupRef = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <Dialog
      role="dialog"
      aria-modal="true"
      aria-label="Edit card options"
      style={{
        top: anchorRect.bottom + window.scrollY + 8,
        left: Math.min(anchorRect.left + 6, window.innerWidth - 320),
        maxWidth: 320,
        width: '100%'
      }}

      ref={popupRef}
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <CardTextArea
          ref={textareaRef}
          value={cardText}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter card title"
          rows={2}
        />
        <SaveButton type="submit">Save</SaveButton>
      </Form>

      <MenuList>
        <MenuItem onClick={() => {
          onClose();
          onOpenFullCard(); // Gọi modal chi tiết
        }}>📄 Open card</MenuItem>
        <MenuItem onClick={() => alert('Change cover')}>🖼 Change cover</MenuItem>
        <MenuItem onClick={() => alert('Edit dates')}>🕓 Edit dates</MenuItem>
        <MenuItem onClick={() => alert('Move')}>➡️ Move</MenuItem>
        <MenuItem onClick={() => alert('Copy card')}>📋 Copy card</MenuItem>
        <MenuItem onClick={() => alert('Copy link')}>🔗 Copy link</MenuItem>
        <MenuItem onClick={() => alert('Archive')}>🗂 Archive</MenuItem>
      </MenuList>
    </Dialog>
  );
}

const Dialog = styled.div`
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  padding: 12px;
  z-index: 2000;

  @media (max-width: 768px) {
    left: 16px !important;
    right: 16px;
    width: auto;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardTextArea = styled.textarea`
  width: 100%;
  font-size: 14px;
  padding: 8px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  resize: none;
  outline: none;
`;

const SaveButton = styled.button`
  align-self: flex-start;
  background: #0c66e4;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const MenuList = styled.ul`
  list-style: none;
  margin-top: 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MenuItem = styled.li`
  background: white;
  border: 1px solid #dcdfe4;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: #f4f5f7;
  }
`;

