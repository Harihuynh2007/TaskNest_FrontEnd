import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaLock, FaUsers, FaGlobe } from 'react-icons/fa';
import styled from 'styled-components';
import BoardBackgroundPopup from './BoardBackgroundPopup';

const visibilityOptions = [
  { key: 'private', label: 'Private', icon: <FaLock className="me-2" />, description: 'Only board members can see this board. Workspace admins can close the board or remove members.' },
  { key: 'workspace', label: 'Workspace', icon: <FaUsers className="me-2" />, description: 'All members of the workspace can see and edit this board.' },
  { key: 'public', label: 'Public', icon: <FaGlobe className="me-2" />, description: 'Anyone on the internet can see this board. Only board members can edit.' }
];

const colorOptions = ['rgb(168, 105, 193)', 'rgb(34, 140, 213)', '#00b8ff', '#f06292', '#0277bd'];

export default function BoardThemeDrawer({ show, onClose, onCreate, isOwner = true }) {
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('workspace');
  const [error, setError] = useState('');
  const [background, setBackground] = useState(colorOptions[0]);
  const drawerRef = useRef();
  const [showBgPopup, setShowBgPopup] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose]);

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Board title is required');
      return;
    }
    console.log('🧪 Gọi onCreate với dữ liệu:', { title, visibility, background }); // THÊM DÒNG NÀY

    onCreate({ title, visibility, background });
    setTitle('');
    setVisibility('workspace');
    setBackground(colorOptions[0]);
    setError('');
  };

  if (!show) return null;

  const handleVisibilityChange = (value) =>{
    if(value === 'public'){
      const ok = window.confirm("This board will be public. Are you sure?");
      if(!ok) return;
    }
    setVisibility(value);
  };
  return (
    <DrawerWrapper ref={drawerRef}>
      <Header>
        <span>Create board</span>
        <CloseBtn onClick={onClose}>×</CloseBtn>
      </Header>

      <PreviewBox style={{ background }}>Board Preview</PreviewBox>

      <Form.Group className="mb-3">
        <Form.Label><strong>Background</strong></Form.Label>
        <ColorRow>
          {colorOptions.map((color, idx) => (
            <ColorDot
              key={idx}
              color={color}
              $active={background === color}
              onClick={() => setBackground(color)}
            />
          ))}
          <ColorDotMore onClick={() => setShowBgPopup(true)}>…</ColorDotMore>
        </ColorRow>
        {showBgPopup && (
          <BoardBackgroundPopup
            onClose={() => setShowBgPopup(false)}
            onSelectBackground={setBackground} // Truyền setBackground trực tiếp
          />
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

      <Form.Group className="mb-4">
        <Form.Label><strong>Visibility</strong></Form.Label>
        <Form.Select
          value={visibility}
          onChange={(e) =>  handleVisibilityChange(e.target.value)}
          disabled={!isOwner}
          aria-label= "Board visibility"
          aria-describedby="visibility-description"
        >
          {visibilityOptions.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </Form.Select>
        <div className="mt-1 text-muted" style={{ fontSize: '0.875rem' }}>
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


      <Button variant="light" className="w-100 mt-3" style={{ fontWeight: 500 }}>
        Start with a template
      </Button>

      <p className="text-muted text-center mt-3" style={{ fontSize: '0.75rem' }}>
        By using images from Unsplash, you agree to their<br /> license and Terms of Service
      </p>
    </DrawerWrapper>
  );
}

const DrawerWrapper = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 320px;
  background: var(--surface-2, #222834);
  color: var(--text-primary, #e1e3e6);
  border: 1px solid var(--panel-border, #3a414f);

  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  z-index: 999;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: 1px solid var(--panel-border, #3a414f);
  width: 28px;
  height: 28px;
  font-size: 18px;
  border-radius: 50%;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  color: var(--text-secondary, #8a93a2);
  transition: all 0.15s;
  &:hover { background: var(--surface-3, #2c3341); color: var(--text-primary, #e1e3e6); }
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
`;

const ColorRow = styled.div`
  display: flex;
  gap: 6px;
`;

const ColorDot = styled.div`
  width: 40px;
  height: 32px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: ${props => (props.$active ? '2px solid var(--brand-primary, #58aff6)' : '1px solid var(--panel-border, #3a414f)')};
  cursor: pointer;
`;

const ColorDotMore = styled.div`
  width: 40px;
  height: 32px;
  border-radius: 4px;

  background: var(--surface-3, #2c3341);
  color: var(--text-primary, #e1e3e6)

  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
`;

const ErrorText = styled.div`
  color: #e76a24;
  font-size: 0.85rem;
  margin-top: 4px;
`;
