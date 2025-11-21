import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

/* ===== Global styles để đảm bảo modal container luôn đúng ===== */
const ModalGlobalStyle = createGlobalStyle`
  #cwm-portal-root {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 999999 !important;
    pointer-events: none;
  }
  
  #cwm-portal-root > * {
    pointer-events: auto;
  }
`;

/* ===== Animations ===== */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

/* ===== Backdrop - styled component với !important ===== */
const Backdrop = styled.div`
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 16px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background-color: rgba(0, 0, 0, 0.65) !important;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 999999 !important;
  box-sizing: border-box !important;
  animation: ${fadeIn} 0.2s ease-out;
`;

/* ===== Card ===== */
const Card = styled.div`
  width: min(96vw, 960px);
  max-height: 92vh;
  background: #2c3750;
  color: #e6e9ee;
  border: 1px solid #3a465e;
  border-radius: 14px;
  box-shadow: 0 24px 50px rgba(0,0,0,0.5);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  animation: ${slideUp} 0.25s ease-out;
  
  @media (max-width: 768px) {
    width: 100%;
    max-height: 95vh;
    border-radius: 14px 14px 0 0;
  }
`;

const Header = styled.div`
  padding: 18px 22px;
  border-bottom: 1px solid #3a465e;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  
  h2 { margin: 0; font-size: 22px; font-weight: 800; color: #e6e9ee; }
  p { margin: 6px 0 0; color: #9aa5b5; font-size: 14px; line-height: 1.5; }
`;

const CloseBtn = styled.button`
  all: unset;
  width: 34px; height: 34px; min-width: 34px;
  border-radius: 10px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #9aa5b5; font-size: 24px; font-weight: 300;
  transition: background 0.15s, color 0.15s;
  
  &:hover { background: #232d3e; color: #e6e9ee; }
`;

const Body = styled.div`
  overflow: auto; padding: 22px;
  display: grid; gap: 22px;
  grid-template-columns: 1.2fr 0.8fr;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 18px 16px;
  }
`;

const Footer = styled.div`
  padding: 14px 22px 18px;
  border-top: 1px solid #3a465e;
  display: flex; justify-content: flex-end; gap: 10px;
`;

const Field = styled.div` display: flex; flex-direction: column; gap: 8px; `;
const Label = styled.label` font-weight: 700; font-size: 14px; color: #e6e9ee; `;
const Helper = styled.div` font-size: 12px; color: #9aa5b5; `;

const ErrorMsg = styled.div`
  font-size: 12px; color: #ffb4a9;
  background: rgba(201, 55, 44, 0.12);
  border: 1px solid rgba(201, 55, 44, 0.35);
  padding: 6px 8px; border-radius: 8px;
`;

const Input = styled.input`
  border: 1px solid ${p => p.$error ? 'rgba(201,55,44,0.55)' : '#3a465e'};
  border-radius: 10px; padding: 10px 12px; font-size: 14px; outline: none;
  background: #1b2331; color: #e6e9ee;
  
  &:focus { border-color: #5bbcf7; box-shadow: 0 0 0 3px rgba(91,188,247,0.3); }
  &::placeholder { color: #9aa5b5; opacity: 0.7; }
`;

const Select = styled.select`
  border: 1px solid ${p => p.$error ? 'rgba(201,55,44,0.55)' : '#3a465e'};
  border-radius: 10px; padding: 10px 12px; font-size: 14px; outline: none;
  background: #1b2331; color: #e6e9ee; cursor: pointer;
  
  &:focus { border-color: #5bbcf7; box-shadow: 0 0 0 3px rgba(91,188,247,0.3); }
`;

const Textarea = styled.textarea`
  border: 1px solid #3a465e;
  border-radius: 10px; padding: 10px 12px; font-size: 14px; outline: none;
  min-height: 110px; resize: vertical;
  background: #1b2331; color: #e6e9ee; font-family: inherit;
  
  &:focus { border-color: #5bbcf7; box-shadow: 0 0 0 3px rgba(91,188,247,0.3); }
  &::placeholder { color: #9aa5b5; opacity: 0.7; }
`;

const CancelBtn = styled.button`
  border: 1px solid #3a465e; background: transparent; color: #e6e9ee;
  font-weight: 600; border-radius: 10px; padding: 10px 16px; cursor: pointer;
  
  &:hover { background: #232d3e; }
`;

const ContinueBtn = styled.button`
  border: 0;
  background: ${p => p.disabled ? 'rgba(91,188,247,0.18)' : 'linear-gradient(135deg, #5bbcf7 0%, #3a7bd5 100%)'};
  color: #fff; font-weight: 800; border-radius: 10px; padding: 10px 20px;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  box-shadow: ${p => p.disabled ? 'none' : '0 4px 14px rgba(58,123,213,0.35)'};
  
  &:hover:not(:disabled) { filter: brightness(1.05); }
`;

const RightPanel = styled.div`
  background: linear-gradient(135deg, rgba(14,20,31,0.7), rgba(20,26,38,0.7));
  border: 1px solid #3a465e; border-radius: 12px; min-height: 280px;
  display: grid; place-items: center; padding: 18px; color: #9aa5b5;
  
  @media (max-width: 768px) { display: none; }
`;

const LeftForm = styled.form` display: flex; flex-direction: column; gap: 16px; `;

const TitleBlock = styled.div`
  h3 { margin: 0 0 6px; font-size: 18px; font-weight: 800; color: #e6e9ee; }
  p { margin: 0; color: #9aa5b5; font-size: 14px; }
`;

const PreviewBox = styled.div`
  text-align: center;
  .preview-title { font-weight: 800; margin-bottom: 8px; color: #e6e9ee; }
  .preview-card {
    height: 140px; border-radius: 12px;
    background: linear-gradient(135deg, #5bbcf7, #3a7bd5);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: #fff; font-size: 24px;
  }
  .preview-desc { margin-top: 12px; color: #9aa5b5; font-size: 14px; }
`;

const TYPES = [
  { value: '', label: 'Choose...' },
  { value: 'company', label: 'Company' },
  { value: 'team', label: 'Team' },
  { value: 'education', label: 'Education' },
  { value: 'personal', label: 'Personal' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'other', label: 'Other' }
];

// Helper: Tạo hoặc lấy portal container
function getPortalContainer() {
  let container = document.getElementById('cwm-portal-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'cwm-portal-root';
    document.body.appendChild(container);
  }
  return container;
}

export default function CreateWorkspaceModal({ onClose, onContinue }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({ name: false, type: false });
  const backdropRef = useRef(null);
  const [portalContainer, setPortalContainer] = useState(null);

  const trimmed = useMemo(() => name.trim(), [name]);

  const nameError = touched.name && (
    trimmed.length === 0 ? 'Workspace name is required.' :
    trimmed.length < 2 ? 'Name must be at least 2 characters.' :
    trimmed.length > 100 ? 'Name must be at most 100 characters.' : ''
  );
  const typeError = touched.type && type === '' ? 'Please choose a workspace type.' : '';
  const isValid = trimmed.length >= 2 && trimmed.length <= 100 && type !== '';

  // Setup portal container + event listeners
  useEffect(() => {
    // Tạo container cho portal
    const container = getPortalContainer();
    setPortalContainer(container);

    // ESC to close
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    
    document.addEventListener('keydown', onKey);
    
    // Lock scroll
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose?.();
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    setTouched({ name: true, type: true });
    if (!isValid) return;
    
    try {
      setBusy(true);
      await onContinue?.({ name: trimmed, type, description: description.trim() });
    } finally {
      setBusy(false);
    }
  };

  const initial = trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';

  // SSR check
  if (typeof document === 'undefined' || !portalContainer) return null;

  const modalContent = (
    <>
      <ModalGlobalStyle />
      <Backdrop
        ref={backdropRef}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cw-title"
      >
        <Card onClick={(e) => e.stopPropagation()}>
          <Header>
            <div>
              <h2 id="cw-title">Let's build a Workspace</h2>
              <p>Boost your productivity by making it easier for everyone to access boards in one location.</p>
            </div>
            <CloseBtn aria-label="Close" onClick={onClose}>×</CloseBtn>
          </Header>

          <Body>
            <LeftForm onSubmit={submit}>
              <TitleBlock>
                <h3>Workspace details</h3>
                <p>This is the name of your company, team or organization.</p>
              </TitleBlock>

              <Field>
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input
                  id="ws-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  placeholder="Taco's Co."
                  $error={!!nameError}
                  autoFocus
                />
                {nameError && <ErrorMsg>{nameError}</ErrorMsg>}
              </Field>

              <Field>
                <Label htmlFor="ws-type">Workspace type</Label>
                <Select
                  id="ws-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, type: true }))}
                  $error={!!typeError}
                >
                  {TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </Select>
                {typeError && <ErrorMsg>{typeError}</ErrorMsg>}
              </Field>

              <Field>
                <Label htmlFor="ws-desc">
                  Workspace description <span style={{ color: '#9aa5b5', fontWeight: 400 }}>Optional</span>
                </Label>
                <Textarea
                  id="ws-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Our team organizes everything here."
                  maxLength={800}
                />
                <Helper>Get your members on board with a few words about your Workspace.</Helper>
              </Field>
            </LeftForm>

            <RightPanel aria-hidden="true">
              <PreviewBox>
                <div className="preview-title">Workspace Preview</div>
                <div className="preview-card">{initial}</div>
                <div className="preview-desc">Cohesive brand & consistent theme</div>
              </PreviewBox>
            </RightPanel>
          </Body>

          <Footer>
            <CancelBtn type="button" onClick={onClose}>Cancel</CancelBtn>
            <ContinueBtn type="button" onClick={submit} disabled={!isValid || busy}>
              {busy ? 'Creating…' : 'Continue'}
            </ContinueBtn>
          </Footer>
        </Card>
      </Backdrop>
    </>
  );

  return createPortal(modalContent, portalContainer);
}