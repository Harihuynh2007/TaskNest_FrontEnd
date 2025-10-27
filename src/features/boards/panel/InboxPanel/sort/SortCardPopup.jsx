import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import FocusLock from 'react-focus-lock';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function SortCardPopup({ anchorEl, onClose, onSelect, onBack }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const popupWidth = 300;
    const popupHeight = 340;
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

  // ✅ Click outside + ESC
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
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -6 }}
          transition={{ duration: 0.18 }}
          style={{ top: pos.top, left: pos.left }}
        >
          <Header>
            {onBack ? (
              <BackBtn aria-label="Go back" onClick={onBack}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </BackBtn>
            ) : (
              <span style={{ width: 32 }} />
            )}

            <Title>Sort cards</Title>

            <IconBtn aria-label="Close" onClick={onClose}>
              <FiX />
            </IconBtn>
          </Header>

          <List>
            {sorts.map(s => (
              <Item key={s.key} onClick={() => onSelect(s.key)}>
                {s.label}
              </Item>
            ))}
          </List>
        </Box>
      </FocusLock>
    </AnimatePresence>
  );

  return createPortal(body, document.body);
}

/* ---------------- STYLES ---------------- */
const Box = styled.div`
  position: absolute;
  z-index: 3000;
  width: 300px;
  background: rgba(17, 25, 40, 0.95);
  backdrop-filter: blur(18px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.45);
  color: #e2e8f0;
  overflow: hidden;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  padding: 10px 12px;
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

const BackBtn = styled(IconBtn)`
  svg { width: 20px; height: 20px; }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 8px 0 10px;
`;

const Item = styled.li`
  margin: 2px 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover, &:focus-visible {
    background: rgba(59,130,246,0.15);
    color: #3b82f6;
    transform: translateX(3px);
    outline: none;
  }
`;
