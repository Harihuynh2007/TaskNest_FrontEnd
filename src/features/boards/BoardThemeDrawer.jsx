import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaLock, FaUsers, FaGlobe } from 'react-icons/fa';
import styled from 'styled-components';

// Mock BoardBackgroundPopup for demo
const BoardBackgroundPopup = ({ onClose, onSelectBackground }) => (
  <div style={{ 
    position: 'absolute', 
    top: '100%', 
    left: 0, 
    right: 0, 
    background: '#2c3341', 
    padding: '12px', 
    borderRadius: '8px',
    marginTop: '8px',
    zIndex: 1000
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <span style={{ fontSize: '14px', fontWeight: 600 }}>More Backgrounds</span>
      <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8a93a2', cursor: 'pointer' }}>×</button>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
      {['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'].map(color => (
        <button
          key={color}
          onClick={() => { onSelectBackground(color); onClose(); }}
          style={{ 
            width: '100%', 
            height: '40px', 
            background: color, 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        />
      ))}
    </div>
  </div>
);

const visibilityOptions = [
  { key: 'private', label: 'Private', icon: <FaLock className="me-2" />, description: 'Only board members can see this board. Workspace admins can close the board or remove members.' },
  { key: 'workspace', label: 'Workspace', icon: <FaUsers className="me-2" />, description: 'All members of the workspace can see and edit this board.' },
  { key: 'public', label: 'Public', icon: <FaGlobe className="me-2" />, description: 'Anyone on the internet can see this board. Only board members can edit.' }
];

const colorOptions = ['#A869C1', '#228CD5', '#00B8FF', '#F06292', '#0277BD'];

const defaultWeekPalette = [
  '#8E9AAF', '#58AFF6', '#6EE7B7', '#FBBF24', '#F472B6', '#A78BFA', '#F87171'
];

export default function BoardThemeDrawer({ show, onClose, onCreate, isOwner = true }) {
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('workspace');
  const [error, setError] = useState('');
  const [background, setBackground] = useState(colorOptions[0]);
  const [autoWeekday, setAutoWeekday] = useState(false);
  const [weekPalette, setWeekPalette] = useState(defaultWeekPalette);

  const drawerRef = useRef();
  const [showBgPopup, setShowBgPopup] = useState(false);

  const todayIndex = new Date().getDay();
  const resolvedBackground = autoWeekday ? weekPalette[todayIndex] : background;

  useEffect(() => {
    function handleClickOutside(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (show) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose]);

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Board title is required');
      return;
    }
    onCreate({ title, visibility, background: resolvedBackground });

    setTitle('');
    setVisibility('workspace');
    setBackground(colorOptions[0]);
    setAutoWeekday(false);
    setWeekPalette(defaultWeekPalette);
    setError('');
  };

  if (!show) return null;

  const handleVisibilityChange = (value) => {
    if (value === 'public') {
      const ok = window.confirm('This board will be public. Are you sure?');
      if (!ok) return;
    }
    setVisibility(value);
  };

  const updateWeekColor = (idx, value) => {
    const next = [...weekPalette];
    next[idx] = value || next[idx];
    setWeekPalette(next);
  };

  return (
    <DrawerWrapper ref={drawerRef} role="dialog" aria-label="Create board drawer">
      <Header>
        <span>Create board</span>
        <CloseBtn onClick={onClose} aria-label="Close">×</CloseBtn>
      </Header>

      <ScrollContent>
        <PreviewBox style={{ background: resolvedBackground }}>
          Board Preview
        </PreviewBox>

        <Form.Group className="mb-3">
          <Form.Label><strong>Background</strong></Form.Label>

          <AutoRow className="mb-2">
            <Form.Check
              type="switch"
              id="auto-weekday-switch"
              label="Auto change by weekday"
              checked={autoWeekday}
              onChange={(e) => setAutoWeekday(e.target.checked)}
            />
            <SmallHint>
              When enabled, the board background uses today's color from the 7-day palette.
            </SmallHint>
          </AutoRow>

          {!autoWeekday && (
            <ColorPickerWrapper>
              <ScrollArea>
                <ColorRow>
                  {colorOptions.map((color, idx) => (
                    <ColorDot
                      key={idx}
                      color={color}
                      $active={background === color}
                      onClick={() => setBackground(color)}
                      aria-label={`Pick ${color}`}
                    />
                  ))}
                  <ColorDotMore onClick={() => setShowBgPopup(true)} aria-label="More backgrounds">…</ColorDotMore>
                </ColorRow>
              </ScrollArea>
              {showBgPopup && (
                <BoardBackgroundPopup
                  onClose={() => setShowBgPopup(false)}
                  onSelectBackground={setBackground}
                />
              )}
            </ColorPickerWrapper>
          )}

          {autoWeekday && (
            <WeekGrid role="group" aria-label="Weekday palette">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                <WeekCell key={d}>
                  <WeekLabel>{d}</WeekLabel>
                  <WeekColor
                    type="color"
                    value={weekPalette[i]}
                    onChange={(e) => updateWeekColor(i, e.target.value)}
                    aria-label={`Pick color for ${d}`}
                  />
                </WeekCell>
              ))}
            </WeekGrid>
          )}
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label><strong>Board title *</strong></Form.Label>
          <Form.Control
            placeholder="Board title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            isInvalid={!!error}
          />
          {error && <ErrorText>👋 {error}</ErrorText>}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><strong>Visibility</strong></Form.Label>
          <Form.Select
            value={visibility}
            onChange={(e) => handleVisibilityChange(e.target.value)}
            disabled={!isOwner}
            aria-label="Board visibility"
            aria-describedby="visibility-description"
          >
            {visibilityOptions.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </Form.Select>
          <div id="visibility-description" className="mt-1 text-muted" style={{ fontSize: '0.875rem' }}>
            {visibilityOptions.find(opt => opt.key === visibility)?.description}
          </div>
        </Form.Group>

        <Button
          variant="primary"
          className="w-100"
          onClick={handleCreate}
          disabled={!title.trim()}
          style={{ background: 'var(--brand-primary, #58aff6)', borderColor: 'transparent', fontWeight: 700 }}
        >
          Create
        </Button>

        <Button variant="light" className="w-100 mt-2" style={{ fontWeight: 500 }}>
          Start with a template
        </Button>

        <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
          By using images from Unsplash, you agree to their<br /> license and Terms of Service
        </p>
      </ScrollContent>
    </DrawerWrapper>
  );
}

const DrawerWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(340px, calc(100vw - 32px));
  max-height: calc(100vh - 80px);
  background: var(--surface-2, #222834);
  color: var(--text-primary, #e1e3e6);
  border: 1px solid var(--panel-border, #3a414f);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  z-index: 1050;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: calc(100vw - 24px);
    max-height: calc(100vh - 40px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  font-weight: 600;
  border-bottom: 1px solid var(--panel-border, #3a414f);
  flex-shrink: 0;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: 1px solid var(--panel-border, #3a414f);
  width: 28px;
  height: 28px;
  font-size: 20px;
  border-radius: 50%;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  color: var(--text-secondary, #8a93a2);
  transition: all 0.15s;
  
  &:hover {
    background: var(--surface-3, #2c3341);
    color: var(--text-primary, #e1e3e6);
  }
`;

const ScrollContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #3a414f;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #4a5260;
  }
`;

const PreviewBox = styled.div`
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  flex-shrink: 0;
`;

const AutoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SmallHint = styled.span`
  font-size: 12px;
  color: var(--text-secondary, #9aa2b1);
  line-height: 1.4;
`;

const ColorPickerWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ScrollArea = styled.div`
  position: relative;
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  padding: 4px 0;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #3a414f;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const ColorRow = styled.div`
  display: flex;
  gap: 8px;
  width: max-content;
  min-width: 100%;
  padding: 2px;
`;

const ColorDot = styled.button`
  width: 44px;
  height: 36px;
  border-radius: 6px;
  background-color: ${p => p.color};
  border: ${p => (p.$active ? '3px solid var(--brand-primary, #58aff6)' : '1px solid var(--panel-border, #3a414f)')};
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`;

const ColorDotMore = styled.button`
  width: 44px;
  height: 36px;
  border-radius: 6px;
  background: var(--surface-3, #2c3341);
  color: var(--text-primary, #e1e3e6);
  border: 1px solid var(--panel-border, #3a414f);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    background: var(--surface-4, #353c4a);
    transform: translateY(-2px);
  }
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

const WeekCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const WeekLabel = styled.span`
  font-size: 11px;
  color: var(--text-secondary, #9aa2b1);
  font-weight: 500;
`;

const WeekColor = styled.input`
  width: 100%;
  height: 32px;
  padding: 0;
  border: 1px solid var(--panel-border, #3a414f);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }
`;

const ErrorText = styled.div`
  color: #e76a24;
  font-size: 0.85rem;
  margin-top: 4px;
`;

// Demo wrapper
function DemoApp() {
  const [show, setShow] = useState(true);
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1a1f2b',
      padding: '20px',
      position: 'relative'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        color: '#e1e3e6'
      }}>
        <h1 style={{ marginBottom: '20px' }}>TaskNest - Board Creation</h1>
        <button 
          onClick={() => setShow(true)}
          style={{
            padding: '10px 20px',
            background: '#58aff6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Open Create Board Drawer
        </button>
        
        {show && (
          <>
            <div 
              style={{ 
                position: 'fixed', 
                inset: 0, 
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1040
              }}
              onClick={() => setShow(false)}
            />
            <BoardThemeDrawer
              show={show}
              onClose={() => setShow(false)}
              onCreate={(data) => {
                console.log('Board created:', data);
                setShow(false);
                alert(`Board created: ${data.title}`);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

