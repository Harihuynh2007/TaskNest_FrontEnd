// components/InboxFilterPopup.jsx — synced color + improved filter logic (no rename)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import ReactDOM from "react-dom";

// === Blue Gradient Design System ===
const BLUE = '#3b82f6';
const CYAN = '#06b6d4';
const BLUE_BG = 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)';
const BLUE_SHADOW = '0 2px 8px rgba(59,130,246,0.30)';

const createdDateOptions = [
  { value: 'week',   label: 'Created in the last week' },
  { value: '2weeks', label: 'Created in the last two weeks' },
  { value: 'month',  label: 'Created in the last month' },
];

const statusOptions = [
  { label: 'Marked as complete',     value: 'completed' },
  { label: 'Not marked as complete', value: 'incomplete' }
];

const dueCheckboxes = [
  { label: 'No dates', value: 'none' },
  { label: 'Overdue',  value: 'overdue' }
];

const dueRanges = [
  { label: 'Due in the next day',   value: 'today' },
  { label: 'Due in the next week',  value: 'week' },
  { label: 'Due in the next month', value: 'month' }
];

export default function InboxFilterPopup({
  filter,
  onClose,
  position,
  setKeyword,
  toggleArrayItem,          
  toggleStatusCheckbox,
  toggleDueWithConstraint,
  setDueRangeSingle
}) {
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const previouslyFocused = useRef(null);

  
  const [debouncedKeyword, setDebouncedKeyword] = useState(filter.keyword || '');
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(debouncedKeyword), 300);
    return () => clearTimeout(timer);
  }, [debouncedKeyword, setKeyword]);

  
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    inputRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') trapFocus(e);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused.current?.focus) {
        previouslyFocused.current.focus({ preventScroll: true });
      }
    };
  }, [onClose]);

  // Click outside để đóng
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Clamp vị trí để không tràn viewport
  const [coords, setCoords] = useState({ left: position?.left || 0, top: position?.top || 0 });
  useEffect(() => {
    const clamp = () => {
      const W = 340; // width popup
      const P = 16;  // padding mép
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const left = Math.min(Math.max(position?.left || 0, P), Math.max(vw - W - P, P));
      const top = Math.min(Math.max(position?.top || 0, P), Math.max(vh - 120, P));
      setCoords({ left, top });
    };
    clamp();
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [position?.left, position?.top]);

  // Count filter đang áp dụng (gợi ý hiển thị)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filter.keyword) count++;
    if (filter.status && filter.status !== 'all') count++;
    if (Array.isArray(filter.due) && filter.due.length > 0) count++;
    if (Array.isArray(filter.created) && filter.created.length > 0) count++;
    return count;
  }, [filter]);

  // Exclusive range (today/week/month): chọn 1, bấm lại để bỏ
  const onToggleRange = (val) => {
    const isSelected = filter.due.includes(val);
    setDueRangeSingle(isSelected ? null : val);
  };

  // Focus trap
  const trapFocus = (e) => {
    const root = wrapperRef.current;
    if (!root) return;
    const focusable = root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  };

  return ReactDOM.createPortal (
    <Wrapper
      ref={wrapperRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inbox-filter-title"
      style={{ top: coords.top, left: coords.left, position: "fixed" }}
    >
      <Header>
        <Title id="inbox-filter-title">Filter</Title>
        {activeFilterCount > 0 && <Badge>{activeFilterCount}</Badge>}
        <CloseBtn onClick={onClose} title="Close (ESC)" aria-label="Close">×</CloseBtn>
      </Header>

      {/* Keyword */}
      <Section>
        <SectionLabel>Keyword</SectionLabel>
        <KeywordInput
          ref={inputRef}
          type="text"
          placeholder="Enter keyword..."
          value={debouncedKeyword}
          onChange={(e) => setDebouncedKeyword(e.target.value)}
        />
      </Section>

      {/* Created (Inbox only) */}
      <Section>
        <SectionLabel>Card created</SectionLabel>
        <CheckboxGroup>
          {createdDateOptions.map(opt => (
            <CheckboxItem key={opt.value} $checked={filter.created.includes(opt.value)}>
              <input
                type="checkbox"
                checked={filter.created.includes(opt.value)}
                onChange={() => toggleArrayItem('created', opt.value)}
              />
              <span>{opt.label}</span>
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </Section>

      {/* Card status (single via ARIA radio) */}
      <Section role="radiogroup" aria-label="Card status">
        <SectionLabel>Card status</SectionLabel>
        <CheckboxGroup>
          {statusOptions.map(opt => {
            const checked = filter.status === opt.value;
            return (
              <CheckboxItem
                key={opt.value}
                $checked={checked}
                role="radio"
                aria-checked={checked}
                onClick={() => toggleStatusCheckbox(opt.value)}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleStatusCheckbox(opt.value)}
                  aria-hidden
                  tabIndex={-1}
                />
                <span>{opt.label}</span>
              </CheckboxItem>
            );
          })}
        </CheckboxGroup>
      </Section>

      {/* Due date */}
      <Section aria-label="Due date" role="group">
        <SectionLabel>Due date</SectionLabel>
        <CheckboxGroup>
          {/* Multi-select */}
          {dueCheckboxes.map(opt => (
            <CheckboxItem key={opt.value} $checked={filter.due.includes(opt.value)}>
              <input
                type="checkbox"
                checked={filter.due.includes(opt.value)}
                onChange={() => toggleDueWithConstraint(opt.value)}
              />
              <span>{opt.label}</span>
            </CheckboxItem>
          ))}
          {/* Exclusive ranges */}
          <div role="radiogroup" aria-label="Due range">
            {dueRanges.map(opt => {
              const selected = filter.due.includes(opt.value);
              return (
                <CheckboxItem
                  key={opt.value}
                  $checked={selected}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onToggleRange(opt.value)}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleRange(opt.value)}
                    aria-hidden
                    tabIndex={-1}
                  />
                  <span>{opt.label}</span>
                </CheckboxItem>
              );
            })}
          </div>
        </CheckboxGroup>
      </Section>
    </Wrapper>,
    document.body
  );
}

/* ==================== STYLES (dark-premium synced) ==================== */
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px) scale(0.95); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
`;

const Wrapper = styled.div`
  position: fixed;
  width: 340px;
  max-height: 80vh;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.25);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: auto;
  animation: ${slideIn} 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  top: 0; left: 0;
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(180deg, rgba(31,41,55,0.9) 0%, rgba(17,24,39,0.9) 100%);
`;

const Title = styled.h4`
  margin: 0; font-size: 16px; font-weight: 700; color: #e5e7eb;
  flex: 1;
`;

const Badge = styled.span`
  background: ${BLUE_BG};
  color: white;
  font-size: 11px; font-weight: 800;
  padding: 3px 8px; border-radius: 12px;
  box-shadow: ${BLUE_SHADOW};
`;

const CloseBtn = styled.button`
  background: transparent; border: none; color: #9ca3af;
  font-size: 20px; cursor: pointer; padding: 4px; border-radius: 8px;
  transition: all .2s ease;
  &:hover { background: rgba(239,68,68,0.12); color: #f87171; transform: rotate(90deg); }
`;

const Section = styled.div`
  padding: 14px; border-bottom: 1px solid rgba(255,255,255,0.06);
  &:last-child { border-bottom: 0; }
`;

const SectionLabel = styled.div`
  font-size: 12px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase;
  color: #93a4b4; margin-bottom: 10px;
`;

const KeywordInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  font-size: 14px;
  color: #e5e7eb;
  background: rgba(17,24,39,.75);
  transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
  &:focus { outline: none; border-color: ${BLUE}; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); transform: translateY(-1px); }
  &::placeholder { color: #93a4b4; }
`;

const CheckboxGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px;
`;

const CheckboxItem = styled.label`
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px; cursor: pointer;
  transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${({ $checked }) => ($checked ? 'rgba(59,130,246,0.10)' : 'transparent')};
  border: 2px solid ${({ $checked }) => ($checked ? BLUE : 'transparent')};
  position: relative; overflow: hidden;

  &::before {
    content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 3px;
    background: ${BLUE_BG};
    transform: scaleY(${({ $checked }) => ($checked ? 1 : 0)});
    transition: transform .2s ease;
  }

  &:hover { background: ${({ $checked }) => ($checked ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.04)')}; transform: translateX(2px); }
  input[type='checkbox'] { width: 18px; height: 18px; cursor: pointer; accent-color: ${BLUE}; }
  span { font-size: 14px; color: #e5e7eb; font-weight: ${({ $checked }) => ($checked ? 600 : 500)}; flex: 1; }
`;
