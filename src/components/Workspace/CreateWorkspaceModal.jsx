// src/components/Workspace/CreateWorkspaceModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

const Backdrop = styled.div`
  position: fixed; inset: 0;
  display: grid; place-items: center;
  background: rgba(0,0,0,.45);
  padding: 16px;
  z-index: 1100;
`;

const Card = styled.div`
  width: min(96vw, 960px);
  max-height: 92vh;
  background: #fff;
  color: #1f2328;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,.22);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 18px 22px;
  border-bottom: 1px solid #e6eaef;
  display: flex; align-items: center; justify-content: space-between;
  h2{margin:0; font-size:22px; font-weight:700;}
  p{margin:6px 0 0; color:#5e6c84;}
`;

const CloseBtn = styled.button`
  border: 0; background: transparent; cursor: pointer;
  font-size: 22px; color: #666; line-height: 1;
`;

const Body = styled.div`
  overflow: auto;
  padding: 22px;
  display: grid;
  gap: 22px;
  grid-template-columns: 1.2fr .8fr;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const Footer = styled.div`
  padding: 14px 22px 18px;
  border-top: 1px solid #e6eaef;
  display: flex; justify-content: flex-end; gap: 10px;
`;

const Field = styled.div`
  display: flex; flex-direction: column; gap: 8px;
`;

const Label = styled.label`
  font-weight: 600; font-size: 14px;
`;

const Helper = styled.div`
  font-size: 12px; color: #6b778c;
`;

const Error = styled.div`
  font-size: 12px; color: #b42318;
`;

const Input = styled.input`
  border: 1px solid ${p => p.$error ? '#ffb4a8' : '#d0d7de'};
  border-radius: 10px;
  padding: 10px 12px; font-size: 14px; outline: none;
  &:focus { border-color:#388bff; box-shadow:0 0 0 3px rgba(56,139,255,.2); }
`;

const Select = styled.select`
  border: 1px solid ${p => p.$error ? '#ffb4a8' : '#d0d7de'};
  border-radius: 10px;
  padding: 10px 12px; font-size: 14px; outline: none; background: #fff;
  &:focus { border-color:#388bff; box-shadow:0 0 0 3px rgba(56,139,255,.2); }
`;

const Textarea = styled.textarea`
  border: 1px solid #d0d7de; border-radius: 10px;
  padding: 10px 12px; font-size: 14px; outline: none;
  min-height: 110px; resize: vertical;
  &:focus { border-color:#388bff; box-shadow:0 0 0 3px rgba(56,139,255,.2); }
`;

const ContinueBtn = styled.button`
  border: 1px solid ${p => p.disabled ? '#c8d1dc' : '#0a66ff'};
  background: ${p => p.disabled ? '#e9edf2' : '#0a66ff'};
  color: ${p => p.disabled ? '#8a97a8' : '#fff'};
  font-weight: 700;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: background .15s;
  &:hover{ background: ${p => p.disabled ? '#e9edf2' : '#0a58e6'}; }
`;

const RightPanel = styled.div`
  background: linear-gradient(135deg, #dcf1ff 0%, #e4fff2 100%);
  border-radius: 12px;
  min-height: 280px;
  display: grid; place-items: center;
  padding: 18px;
  img{ max-width: 90%; height: auto; }
  @media (max-width: 768px) { display: none; }
`;

const LeftForm = styled.form`
  display: flex; flex-direction: column; gap: 16px;
`;

const TitleBlock = styled.div`
  display: flex; flex-direction: column;
  h3{ margin: 0 0 6px; font-size: 18px; font-weight: 700; }
  p{ margin: 0; color: #5e6c84; }
`;

const WORKSPACE_TYPES = [
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
        trimmed.length > 100 ? 'Name must be at most 100 characters.' :
        ''
        );

    const typeError =
        touched.type && (type === '' ? 'Please choose a workspace type.' : '');

    const isValid = trimmed.length >= 2 && trimmed.length <= 100 && type !== '';

    // close on ESC, lock scroll
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

    const submit = async(e) => {
        e.preventDefault();
        setTouched({ name: true, type: true });
        if (!isValid) return;
        try{
            setBusy(true);
            await onContinue?.({ name: trimmed, type, description: description.trim() })
        }finally {
            setBusy(false);
        }
    };

    return (
        <Backdrop onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}>
        <Card onMouseDown={(e)=>e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="cw-title">
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
                    {WORKSPACE_TYPES.map(opt=>(
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </Select>
                {typeError ? <Error>{typeError}</Error> : null}
                </Field>

                <Field>
                <Label htmlFor="ws-desc">Workspace description <span style={{color:'#6b778c', fontWeight:400}}>Optional</span></Label>
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
                <img alt="" src="https://placehold.co/520x300?text=Workspace+Preview" />
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
}
