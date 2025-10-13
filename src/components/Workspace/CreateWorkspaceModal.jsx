import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

/* ===== Backdrop + Card (dark-premium) ===== */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(0,0,0,.45);
  z-index: 5000; /* cao hơn header/sidebar/anything */
`;
const Card = styled.div`
  width: min(96vw, 960px);
  max-height: 92vh;
  background: var(--surface-4, #2c3750);
  color: var(--text-primary, #e6e9ee);
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 14px;
  box-shadow: 0 18px 44px rgba(0,0,0,.38);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
`;

/* ===== Header / Body / Footer ===== */
const Header = styled.div`
  padding: 18px 22px;
  border-bottom: 1px solid var(--panel-border, #3a465e);
  display: flex; align-items: center; justify-content: space-between;
  h2{margin:0; font-size:22px; font-weight:800;}
  p{margin:6px 0 0; color: var(--text-secondary, #9aa5b5);}
`;
const CloseBtn = styled.button`
  all: unset; width: 34px; height: 34px; border-radius: 10px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--text-secondary, #9aa5b5);
  &:hover{ background: var(--surface-3, #232d3e); color: var(--text-primary); }
`;
const Body = styled.div`
  overflow: auto;
  padding: 22px;
  display: grid;
  gap: 22px;
  grid-template-columns: 1.2fr .8fr;
  @media (max-width: 992px) { grid-template-columns: 1fr; }
`;
const Footer = styled.div`
  padding: 14px 22px 18px;
  border-top: 1px solid var(--panel-border, #3a465e);
  display: flex; justify-content: flex-end; gap: 10px;
`;

/* ===== Controls ===== */
const Field = styled.div`display:flex;flex-direction:column;gap:8px;`;
const Label = styled.label`font-weight:700;font-size:14px;`;
const Helper = styled.div`font-size:12px;color:var(--text-secondary,#9aa5b5);`;
const Error = styled.div`
  font-size:12px;color:#ffb4a9;background:rgba(201,55,44,0.12);
  border:1px solid rgba(201,55,44,0.35);padding:6px 8px;border-radius:8px;
`;
const Input = styled.input`
  border:1px solid ${p=>p.$error?'rgba(201,55,44,.55)':'var(--panel-border,#3a465e)'};
  border-radius:10px;padding:10px 12px;font-size:14px;outline:none;
  background:var(--surface-2,#1b2331);color:var(--text-primary,#e6e9ee);
  &:focus{border-color:transparent;box-shadow:0 0 0 3px var(--ring,rgba(91,188,247,.38));}
`;
const Select = styled.select`
  border:1px solid ${p=>p.$error?'rgba(201,55,44,.55)':'var(--panel-border,#3a465e)'};
  border-radius:10px;padding:10px 12px;font-size:14px;outline:none;
  background:var(--surface-2,#1b2331);color:var(--text-primary,#e6e9ee);
  &:focus{border-color:transparent;box-shadow:0 0 0 3px var(--ring,rgba(91,188,247,.38));}
`;
const Textarea = styled.textarea`
  border:1px solid var(--panel-border,#3a465e);border-radius:10px;
  padding:10px 12px;font-size:14px;outline:none;min-height:110px;resize:vertical;
  background:var(--surface-2,#1b2331);color:var(--text-primary,#e6e9ee);
  &:focus{border-color:transparent;box-shadow:0 0 0 3px var(--ring,rgba(91,188,247,.38));}
`;
const ContinueBtn = styled.button`
  border:0;
  background:${p=>p.disabled?'rgba(91,188,247,.18)':'var(--brand-gradient,linear-gradient(135deg,#5bbcf7 0%, #3a7bd5 100%))'};
  color:#fff;font-weight:800;border-radius:10px;padding:10px 16px;
  cursor:${p=>p.disabled?'not-allowed':'pointer'};
  box-shadow:0 4px 14px rgba(58,123,213,.35);
  transition:filter .15s, box-shadow .15s, transform .05s;
  &:hover{filter:${p=>p.disabled?'none':'brightness(1.03)'};box-shadow:${p=>p.disabled?'none':'0 8px 20px rgba(58,123,213,.45)'};}
  &:active{transform:translateY(1px);}
`;

const RightPanel = styled.div`
  background: linear-gradient(135deg, rgba(14,20,31,.7) 0%, rgba(20,26,38,.7) 100%),
              url('https://placehold.co/1200x600/0f172a/ffffff?text=Workspace+Preview') center/cover no-repeat;
  border: 1px solid var(--panel-border,#3a465e);
  border-radius: 12px; min-height: 280px;
  display:grid;place-items:center;padding:18px;color:var(--text-secondary,#9aa5b5);
  @media (max-width:768px){display:none;}
`;
const LeftForm = styled.form`display:flex;flex-direction:column;gap:16px;`;
const TitleBlock = styled.div`
  display:flex;flex-direction:column;
  h3{margin:0 0 6px;font-size:18px;font-weight:800;}
  p{margin:0;color:var(--text-secondary,#9aa5b5);}
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

export default function CreateWorkspaceModal({ onClose, onContinue }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({ name: false, type: false });

  const trimmed = useMemo(() => name.trim(), [name]);

  const nameError =
    touched.name && (
      trimmed.length === 0 ? 'Workspace name is required.' :
      trimmed.length < 2 ? 'Name must be at least 2 characters.' :
      trimmed.length > 100 ? 'Name must be at most 100 characters.' : ''
    );
  const typeError = touched.type && (type === '' ? 'Please choose a workspace type.' : '');
  const isValid = trimmed.length >= 2 && trimmed.length <= 100 && type !== '';

  // Khóa scroll + ESC để đóng
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

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

  const modal = (
    <Backdrop
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog" aria-modal="true" aria-labelledby="cw-title"
    >
      <Card onMouseDown={(e)=>e.stopPropagation()}>
        <Header>
          <div>
            <h2 id="cw-title">Let’s build a Workspace</h2>
            <p>Boost your productivity by making it easier for everyone to access boards in one location.</p>
          </div>
          <CloseBtn aria-label="Close" onClick={onClose}>×</CloseBtn>
        </Header>

        <Body>
          <LeftForm onSubmit={submit}>
            <TitleBlock>
              <h3>Workspace name</h3>
              <Helper>This is the name of your company, team or organization.</Helper>
            </TitleBlock>

            <Field>
              <Label htmlFor="ws-name">Workspace name</Label>
              <Input
                id="ws-name"
                value={name}
                onChange={e=>setName(e.target.value)}
                onBlur={()=>setTouched(t=>({...t, name:true}))}
                placeholder="Taco’s Co."
                $error={!!nameError}
              />
              {nameError ? <Error>{nameError}</Error> : null}
            </Field>

            <Field>
              <Label htmlFor="ws-type">Workspace type</Label>
              <Select
                id="ws-type"
                value={type}
                onChange={e=>setType(e.target.value)}
                onBlur={()=>setTouched(t=>({...t, type:true}))}
                $error={!!typeError}
              >
                {TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </Select>
              {typeError ? <Error>{typeError}</Error> : null}
            </Field>

            <Field>
              <Label htmlFor="ws-desc">Workspace description <span style={{color:'var(--text-secondary)', fontWeight:400}}>Optional</span></Label>
              <Textarea
                id="ws-desc"
                value={description}
                onChange={e=>setDescription(e.target.value)}
                placeholder="Our team organizes everything here."
                maxLength={800}
              />
              <Helper>Get your members on board with a few words about your Workspace.</Helper>
            </Field>
          </LeftForm>

          <RightPanel aria-hidden>
            <div style={{textAlign:'center'}}>
              <div style={{fontWeight:800, marginBottom:8, color:'var(--text-primary)'}}>Workspace Preview</div>
              <div style={{
                height:140, borderRadius:12,
                background:'linear-gradient(135deg,#5bbcf7 0%, #3a7bd5 100%)',
                border:'1px solid var(--panel-border)'
              }}/>
              <div style={{marginTop:12, color:'var(--text-secondary)'}}>Cohesive brand & consistent theme</div>
            </div>
          </RightPanel>
        </Body>

        <Footer>
          <ContinueBtn onClick={submit} disabled={!isValid || busy}>
            {busy ? 'Creating…' : 'Continue'}
          </ContinueBtn>
        </Footer>
      </Card>
    </Backdrop>
  );

  // 🔒 Render qua Portal để tránh bị clip/đẩy bởi grid/overflow của trang
  return ReactDOM.createPortal(modal, document.body);
}
