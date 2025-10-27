// src/features/boards/panel/BoardPanel/components/BoardMenuPopup.jsx
import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import {
  FiFilter,
  FiShare2,
  FiStar,
  FiX,
  FiImage,
  FiSettings,
  FiTrash2
} from 'react-icons/fi';
import FocusLock from 'react-focus-lock';

export default function BoardMenuPopup({ anchorEl, onClose, onOpenInvite, onCloseBoard, onToggleStar, setShowFilter, isStarred }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const popupWidth = 300;
    const popupHeight = 320;
    const margin = 8;

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const top = clamp(
      rect.bottom + window.scrollY + margin,
      window.scrollY + margin,
      window.scrollY + window.innerHeight - popupHeight - margin
    );
    const left = clamp(
      rect.right + window.scrollX - popupWidth,
      window.scrollX + margin,
      window.scrollX + window.innerWidth - popupWidth - margin
    );
    setPos({ top, left });
  }, [anchorEl]);

  useLayoutEffect(updatePosition, [anchorEl]);

  useEffect(() => {
    const fn = () => updatePosition();
    window.addEventListener('resize', fn);
    window.addEventListener('scroll', fn, true);
    return () => {
      window.removeEventListener('resize', fn);
      window.removeEventListener('scroll', fn, true);
    };
  }, [updatePosition]);

  // Click outside + ESC
  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const body = (
    <FocusLock>
      <Box ref={ref} style={{ top: pos.top, left: pos.left }} role="dialog" aria-label="Board menu">
        <Header>
          <Title>Board Menu</Title>
          <IconBtn aria-label="Close" onClick={onClose}><FiX /></IconBtn>
        </Header>

        <Section>
          <Item onClick={() => setShowFilter(prev => !prev)}>
            <FiFilter /><span>Filter cards</span>
          </Item>
          <Item onClick={onToggleStar}>
            <FiStar style={{ color: isStarred ? '#facc15' : undefined }} />
            <span>{isStarred ? 'Unstar board' : 'Star board'}</span>
          </Item>
          <Item onClick={onOpenInvite}>
            <FiShare2 /><span>Share board</span>
          </Item>
        </Section>

        <Divider />

        <Section>
          <Item disabled><FiSettings /><span>Board settings (coming soon)</span></Item>
          <Item disabled><FiImage /><span>Change background (coming soon)</span></Item>
        </Section>

        <Divider />

        <DangerItem onClick={onCloseBoard}>
          <FiTrash2 /><span>Close board</span>
        </DangerItem>
      </Box>
    </FocusLock>
  );

  return createPortal(body, document.body);
}

/* ---------- styled ---------- */
const Box = styled.div`
  position: absolute;
  z-index: 3000;
  width: 300px;
  background: rgba(17, 25, 40, 0.95);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.45);
  backdrop-filter: blur(18px);
  overflow: hidden;
  color: #e2e8f0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const IconBtn = styled.button`
  height: 28px; width: 28px;
  border: none; background: transparent;
  color: #e2e8f0;
  border-radius: 6px; cursor: pointer;
  display: grid; place-items: center;
  transition: background 0.15s ease;
  &:hover { background: rgba(255,255,255,0.18); }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
`;

const Item = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: none;
  background: transparent;
  color: #cbd5e1;
  font-size: 14px;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover, &:focus-visible {
    background: rgba(59,130,246,0.15);
    color: #3b82f6;
    transform: translateX(3px);
    outline: none;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
  svg { width: 16px; height: 16px; }
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 4px 0;
`;

const DangerItem = styled(Item)`
  color: #ef4444;
  &:hover {
    background: rgba(239,68,68,0.15);
    color: #f87171;
  }
`;
