// src/components/sort/SortCardPopup.jsx
import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import FocusLock from 'react-focus-lock';
import { motion, AnimatePresence } from 'framer-motion';

export default function SortCardPopup({ anchorEl, onClose, onSelect, onBack  }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });


  const updatePosition = useCallback(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const popupWidth = 260;
    const popupHeight = 260;
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


  // Cập nhật ngay khi mount
  useLayoutEffect(updatePosition, [anchorEl]);
  // Theo dõi resize/scroll
  
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

  const sorts = [
    { key: 'created_newest', label: 'Created – Newest first' },
    { key: 'created_oldest', label: 'Created – Oldest first' },
    { key: 'name_az', label: 'Name – A → Z' },
    { key: 'name_za', label: 'Name – Z → A' },
    { key: 'due_earliest', label: 'Due date – Earliest first' },
    { key: 'due_latest',  label: 'Due date – Latest first' },
    { key: 'completed_first',   label: 'Completed first' },
    { key: 'incomplete_first',  label: 'Incomplete first' },
  ];

  const body = (
    <AnimatePresence>
      <FocusLock>
        <Box
          ref={ref}
          as={motion.div}
          role="dialog"
          aria-label="Sort cards"
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.16 }}
          style={{ top: pos.top, left: pos.left }}
        >
          <Header>
            <IconBtn
              aria-label="Go back"
              onClick={() => {
                if (onBack) onBack(); // ✅ quay lại menu
                else onClose();       // fallback nếu không truyền onBack
              }}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconBtn>

            <Title>Sort cards</Title>
            <IconBtn aria-label="Close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </IconBtn>
          </Header>

          <List>
            {sorts.map(s => (
              <Item key={s.key} onClick={() => onSelect(s.key)}>{s.label}</Item>
            ))}
          </List>
        </Box>
      </FocusLock>
    </AnimatePresence>
  );

  return createPortal(body, document.body);
}

// ---- styled ----
const Box = styled.div`
  position: absolute;
  z-index: 3000;
  width: 260px;
  background: var(--surface-2, #1f2633);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.45);
  backdrop-filter: blur(10px);
  overflow: hidden;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: #e2e8f0;
`;

const Title = styled.div`
  text-align: center;
  font-weight: 600;
  font-size: 14px;
`;

const IconBtn = styled.button`
  height: 32px;
  width: 32px;
  border: none;
  background: transparent;
  color: inherit;
  display: grid;
  place-items: center;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover, &:focus-visible { background: rgba(255,255,255,0.18); outline: none; }
  svg { width: 18px; height: 18px; }
`;

const List = styled.ul`
  list-style: none;
  margin: 0; padding: 8px 0;
`;

const Item = styled.li`
  margin: 2px 8px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover, &:focus-visible {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    color: #fff; outline: none;
  }
`;
