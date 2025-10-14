import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { FiX, FiSearch, FiFilter } from 'react-icons/fi';
import LabelFilterItem from './LabelFilterItem';
import MemberFilterItem from './MemberFilterItem';

/**
 * TaskNest UI tokens — Blue Gradient Design System
 */
const BLUE = '#3b82f6';
const CYAN = '#06b6d4';
const BLUE_BG = 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)';
const BLUE_BG_HOVER = 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)';
const BLUE_SHADOW = '0 2px 8px rgba(59,130,246,0.30)';

const statusOptions = [
  { label: 'Marked as complete', value: 'completed' },
  { label: 'Not marked as complete', value: 'incomplete' }
];

const dueCheckboxes = [
  { label: 'No dates', value: 'none' },
  { label: 'Overdue', value: 'overdue' }
];

const dueRanges = [
  { label: 'Due in the next day', value: 'today' },
  { label: 'Due in the next week', value: 'week' },
  { label: 'Due in the next month', value: 'month' }
];

/**
 * Portal root helper — reuse a single DOM node for overlays
 */
function getPortalRoot() {
  let root = document.getElementById('tasknest-portal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'tasknest-portal-root';
    document.body.appendChild(root);
  }
  return root;
}

export default function BoardFilterPopup({
  filter,
  onClose,
  position,
  members = [],
  labels = [],
  matchedCardsCount = 0,
  setKeyword,
  toggleArrayItem,
  toggleStatusCheckbox,
  toggleDueWithConstraint,
  setDueRangeSingle,
  resetFilter
}) {
  const [debouncedKeyword, setDebouncedKeyword] = useState(filter.keyword || '');
  const [coords, setCoords] = useState({ left: position?.left || 0, top: position?.top || 0 });
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Debounce keyword → upstream setKeyword
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(debouncedKeyword), 300);
    return () => clearTimeout(timer);
  }, [debouncedKeyword, setKeyword]);

  // Autofocus & focus management (trap + restore)
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
      // restore focus
      if (previouslyFocused.current && previouslyFocused.current.focus) {
        previouslyFocused.current.focus({ preventScroll: true });
      }
    };
  }, [onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Clamp position to viewport (safe positioning)
  useEffect(() => {
    const clamp = () => {
      const W = 340; // popup width
      const P = 16;  // padding from edges
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const left = Math.min(Math.max(position.left || 0, P), Math.max(vw - W - P, P));
      const top = Math.min(Math.max(position.top || 0, P), Math.max(vh - 120, P));
      setCoords({ left, top });
    };
    clamp();
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [position?.left, position?.top]);

  // Count active filters (unchanged logic)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filter.keyword) count++;
    if (filter.status !== 'all') count++;
    if (Array.isArray(filter.due) && filter.due.length > 0) count++;
    if (Array.isArray(filter.members) && filter.members.length > 0) count++;
    if (Array.isArray(filter.labels) && filter.labels.length > 0) count++;
    return count;
  }, [filter]);

  // Preserve single-select behavior for ranges while keeping checkbox input
  const onToggleRange = (val) => {
    const isSelected = filter.due.includes(val);
    setDueRangeSingle(isSelected ? null : val);
  };

  const handleClearAll = () => {
    resetFilter();
    setDebouncedKeyword('');
    inputRef.current?.focus({ preventScroll: true });
  };

  // Focus trap util
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

  const content = (
    <Wrapper
      ref={wrapperRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="board-filter-title"
      style={{ top: coords.top, left: coords.left }}
    >
      <Header>
        <HeaderLeft>
          <FiFilter />
          <Title id="board-filter-title">Filter Cards</Title>
          {activeFilterCount > 0 && <FilterBadge>{activeFilterCount}</FilterBadge>}
        </HeaderLeft>
        <CloseBtn onClick={onClose} title="Close (ESC)" aria-label="Close">
          <FiX />
        </CloseBtn>
      </Header>

      <QuickActions>
        <MatchCount>
          <span className="count">{matchedCardsCount}</span> cards match
        </MatchCount>
        {activeFilterCount > 0 && <ClearButton onClick={handleClearAll}>Clear all</ClearButton>}
      </QuickActions>

      <ScrollContent>
        <Section>
          <SectionLabel>
            <FiSearch />
            Keyword
          </SectionLabel>
          <SearchInputWrapper>
            <SearchIcon><FiSearch /></SearchIcon>
            <KeywordInput
              ref={inputRef}
              type="text"
              placeholder="Search cards, members, labels..."
              value={debouncedKeyword}
              onChange={(e) => setDebouncedKeyword(e.target.value)}
            />
            {debouncedKeyword && (
              <ClearInputBtn onClick={() => setDebouncedKeyword('')} aria-label="Clear keyword">
                <FiX />
              </ClearInputBtn>
            )}
          </SearchInputWrapper>
        </Section>

        {members.length > 0 && (
          <Section>
            <SectionLabel>
              Members {filter.members.length > 0 && `(${filter.members.length})`}
            </SectionLabel>
            <CheckboxGroup>
              {members.map((m) => (
                <MemberFilterItem
                  key={m.id}
                  member={m}
                  checked={filter.members.includes(m.id)}
                  onToggle={() => toggleArrayItem('members', m.id)}
                />
              ))}
            </CheckboxGroup>
          </Section>
        )}

        <Section aria-label="Card status" role="radiogroup">
          <SectionLabel>Card status</SectionLabel>
          <CheckboxGroup>
            {statusOptions.map((opt) => {
              const checked = filter.status === opt.value;
              return (
                <CheckboxItem
                  key={opt.value}
                  $checked={checked}
                  role="radio"
                  aria-checked={checked}
                  onClick={() => toggleStatusCheckbox(opt.value)}
                >
                  {/* Keep checkbox input for compatibility; expose as radio via ARIA */}
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

        <Section aria-label="Due date" role="group">
          <SectionLabel>
            Due date {filter.due.length > 0 && `(${filter.due.length})`}
          </SectionLabel>
          <CheckboxGroup>
            {/* Multi-select checkboxes */}
            {dueCheckboxes.map((opt) => (
              <CheckboxItem key={opt.value} $checked={filter.due.includes(opt.value)}>
                <input
                  type="checkbox"
                  checked={filter.due.includes(opt.value)}
                  onChange={() => toggleDueWithConstraint(opt.value)}
                />
                <span>{opt.label}</span>
              </CheckboxItem>
            ))}

            {/* Exclusive range — behave like radio but allow deselect when selected */}
            <div role="radiogroup" aria-label="Due range">
              {dueRanges.map((opt) => {
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

        {labels.length > 0 && (
          <Section>
            <SectionLabel>
              Labels {filter.labels.length > 0 && `(${filter.labels.length})`}
            </SectionLabel>
            <CheckboxGroup>
              {labels.map((label) => (
                <LabelFilterItem
                  key={label.id}
                  label={label}
                  checked={filter.labels.includes(label.id)}
                  onToggle={() => toggleArrayItem('labels', label.id)}
                />
              ))}
            </CheckboxGroup>
          </Section>
        )}
      </ScrollContent>
    </Wrapper>
  );

  return ReactDOM.createPortal(content, getPortalRoot());
}

// ==================== ANIMATIONS ====================
const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(20px) scale(0.95); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// ==================== STYLED COMPONENTS ====================
const Wrapper = styled.div`
  position: fixed;
  width: 340px;
  max-height: 80vh;
  background: rgba(17, 24, 39, 0.95); /* dark-premium */
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: ${slideInRight} 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  top: 0; left: 0; /* actual coords injected inline via style */

  @media (max-width: 768px) {
    width: calc(100vw - 32px);
    max-width: 360px;
    left: 16px !important;
    right: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(31,41,55,0.9) 0%, rgba(17,24,39,0.9) 100%);
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  svg { color: ${BLUE}; font-size: 18px; }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #e5e7eb; /* gray-200 */
`;

const FilterBadge = styled.span`
  background: ${BLUE_BG};
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
  box-shadow: ${BLUE_SHADOW};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 22px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(239,68,68,0.12); color: #f87171; transform: rotate(90deg); }
`;

const QuickActions = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px;
  background: rgba(59,130,246,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
`;

const MatchCount = styled.div`
  font-size: 13px; color: #cbd5e1; font-weight: 500;
  .count { font-weight: 700; color: ${BLUE}; font-size: 15px; }
`;

const ClearButton = styled.button`
  background: transparent;
  border: 1px solid #f87171; /* soft danger */
  color: #fecaca;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover { background: #ef4444; color: white; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(239, 68, 68, 0.35); }
  &:active { transform: translateY(0); }
`;

const ScrollContent = styled.div`
  flex: 1; overflow-y: auto; padding: 14px 18px;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.35); border-radius: 4px; }
`;

const Section = styled.div`
  margin-bottom: 18px;
  &:last-child { margin-bottom: 0; }
`;

const SectionLabel = styled.div`
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 700;
  color: #93a4b4; text-transform: uppercase; letter-spacing: 0.5px;
  margin-bottom: 10px;
  svg { font-size: 14px; }
`;

const SearchInputWrapper = styled.div`
  position: relative; display: flex; align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute; left: 12px; color: #93a4b4; font-size: 16px; pointer-events: none; z-index: 1;
`;

const KeywordInput = styled.input`
  width: 100%;
  padding: 10px 36px 10px 38px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  font-size: 14px;
  color: #e5e7eb;
  background: rgba(17,24,39, 0.75);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  &:focus { outline: none; border-color: ${BLUE}; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); transform: translateY(-1px); }
  &::placeholder { color: #93a4b4; }
`;

const ClearInputBtn = styled.button`
  position: absolute; right: 8px;
  background: rgba(255,255,255,0.06);
  border: none; color: #cbd5e1;
  padding: 4px; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
  &:hover { background: rgba(239,68,68,0.12); color: #fca5a5; }
  svg { font-size: 14px; }
`;

const CheckboxGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px;
`;

const CheckboxItem = styled.label`
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px; cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${({ $checked }) => ($checked ? 'rgba(59,130,246,0.10)' : 'transparent')};
  border: 2px solid ${({ $checked }) => ($checked ? BLUE : 'transparent')};
  position: relative; overflow: hidden;
  &::before {
    content: '';
    position: absolute; left: 0; top: 0; height: 100%; width: 3px;
    background: ${BLUE_BG};
    transform: scaleY(${({ $checked }) => ($checked ? 1 : 0)});
    transition: transform 0.2s ease;
  }
  &:hover { background: ${({ $checked }) => ($checked ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.04)')}; transform: translateX(2px); }
  input[type='checkbox'] { width: 18px; height: 18px; cursor: pointer; accent-color: ${BLUE}; }
  span { font-size: 14px; color: #e5e7eb; font-weight: ${({ $checked }) => ($checked ? 600 : 500)}; flex: 1; }
`;
