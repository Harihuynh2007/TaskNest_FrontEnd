// src/components/InviteWorkspaceModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiLink } from 'react-icons/fi';
import { X } from 'react-feather';
import dayjs from 'dayjs';
import ReactDOM from 'react-dom';
import { inviteMember, createShareLink } from '../../api/workspaceApi';

const Backdrop = styled.div`
  position: fixed; inset: 0;
  display: grid; place-items: center;
  padding: 16px;
  background: rgba(0,0,0,0.45);
  z-index: 5000;
`;

const Card = styled.div`
  width: min(92vw, 620px);
  max-height: 90vh;
  background: var(--surface-4, #2c3750); color: var(--text-primary, #e6e9ee);
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 14px;
  box-shadow: 0 16px 42px rgba(0,0,0,.36);
  display: flex; flex-direction: column;
`;

const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  padding: 14px 18px; border-bottom: 1px solid var(--panel-border, #3a465e);
  h3{margin:0; font-size:18px; font-weight:800;}
  button{
    all: unset; width: 32px; height: 32px; border-radius: 8px;
    display:inline-flex; align-items:center; justify-content:center; cursor:pointer;
    color: var(--text-secondary, #9aa5b5);
    &:hover{ background: var(--surface-3, #232d3e); color: var(--text-primary); }
  }
`;

const Body = styled.div`
  padding: 16px 18px; overflow:auto; display:grid; gap:12px;
`;

const Footer = styled.div`
  padding: 12px 18px 16px; border-top: 1px solid var(--panel-border, #3a465e);
  display:flex; justify-content:flex-end; gap:8px;
`;

const Row = styled.div`
  display:flex; align-items:center; gap:10px; flex-wrap:wrap;
`;

const InputShell = styled.div` position: relative; width: 100%; `;

const EmailInput = styled.input`
  width: 100%;
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px; outline: none;
  background: var(--surface-2, #1b2331);
  color: var(--text-primary, #e6e9ee);
  transition: box-shadow .15s, border-color .15s;
  &:focus { border-color: transparent; box-shadow: 0 0 0 3px var(--ring, rgba(91,188,247,.38)); }
`;

const PillBox = styled.div`
  width: 100%;
  display:flex; align-items:center; gap:8px;
  border: 1px solid var(--panel-border, #3a465e); border-radius: 10px;
  padding: 6px 8px 6px 10px; background: var(--surface-2, #1b2331);
`;

const Pill = styled.span`
  display:inline-flex; align-items:center; gap:6px;
  background: rgba(91,188,247,.18); color: var(--brand-primary, #5bbcf7);
  border:1px solid rgba(91,188,247,.4); border-radius: 999px;
  padding: 6px 8px; font-size: 13px; font-weight:700;
  svg{cursor:pointer}
`;

const SendBtn = styled.button`
  margin-left: auto;
  border: 0; background: var(--brand-gradient, linear-gradient(135deg,#5bbcf7 0%, #3a7bd5 100%)); color:#fff;
  border-radius: 10px; padding: 10px 12px; font-weight:800;
  box-shadow: 0 4px 14px rgba(58,123,213,.35);
  cursor:pointer; transition: filter .15s, box-shadow .15s;
  &:hover{ filter:brightness(1.03); box-shadow:0 8px 20px rgba(58,123,213,.45);}
  &:disabled{ opacity:.6; cursor:not-allowed; box-shadow:none; }
`;

const TextArea = styled.textarea`
  width:100%; min-height: 88px; resize: vertical;
  border:1px solid var(--panel-border, #3a465e); border-radius:10px;
  padding: 10px 12px; font-size:14px; outline: none;
  background: var(--surface-2, #1b2331);
  color: var(--text-primary, #e6e9ee);
  &:focus { border-color: transparent; box-shadow:0 0 0 3px var(--ring, rgba(91,188,247,.38)); }
`;

const Subtle = styled.div` margin-top: 6px; font-size: 14px; color: var(--text-secondary, #9aa5b5); `;

const Button = styled.button`
  border: 1px solid var(--panel-border, #3a465e); background: var(--surface-2, #1b2331); color: var(--text-primary, #e6e9ee);
  padding: 8px 12px; border-radius: 10px; cursor: pointer;
  display:inline-flex; align-items:center; gap:8px; font-weight:700;
  &:hover{ background: var(--surface-3, #232d3e); }
  &:disabled{ opacity:.6; cursor:not-allowed; }
`;

const Primary = styled(Button)`
  background: var(--brand-gradient, linear-gradient(135deg,#5bbcf7 0%, #3a7bd5 100%));
  border: none; color:#fff;
  box-shadow: 0 4px 14px rgba(58,123,213,.35);
  &:hover{ filter:brightness(1.03); box-shadow:0 8px 20px rgba(58,123,213,.45); }
`;

const LinkBox = styled.div`
  margin-top: 10px; display:flex; gap:8px;
  input{
    flex:1; border:1px solid var(--panel-border, #3a465e); border-radius:8px; padding:8px 10px; font-size:13px;
    background: var(--surface-2, #1b2331); color: var(--text-primary, #e6e9ee);
    &:focus{ outline:none; box-shadow:0 0 0 3px var(--ring, rgba(91,188,247,.38)); border-color: transparent; }
  }
`;

// helpers
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteWorkspaceModal({
  workspaceId,
  workspaceName = 'Workspace',
  onClose
}) {
  const [raw, setRaw] = useState('');
  const [selected, setSelected] = useState(null); // {label, value, type}
  const [message, setMessage] = useState('Join this Workspace to start collaborating with me!');
  const [sending, setSending] = useState(false);

  const [creating, setCreating] = useState(false);
  const [link, setLink] = useState('');

  const origin = useMemo(() => window.location.origin, []);

  useEffect(() => {
    const onKey = (e)=>{ if(e.key==='Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return ()=>{
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    }
  }, [onClose]);

  // Enter trong input
  const trySelect = () => {
    const v = raw.trim();
    if (!v) return;
    if (emailRegex.test(v)) { setSelected({ label: v, value: v, type: 'email' }); setRaw(''); return; }
    if (v.startsWith('@') && v.length > 1) { setSelected({ label: v, value: v.slice(1), type: 'username' }); setRaw(''); return; }
    setSelected({ label: v, value: v, type: 'email' }); setRaw('');
  };

  const removeSelected = () => setSelected(null);

  const handleSendInvite = async () => {
    if (!selected) return;
    setSending(true);
    try {
      const email = selected.type === 'email' ? selected.value : `${selected.value}@example.com`;
      await inviteMember(workspaceId, {
        email,
        role: 'member',
        message,
        expires_at: dayjs().add(7, 'day').toISOString()
      });
      setSelected(null);
      setMessage('Join this Workspace to start collaborating with me!');
    } catch (e) {
      console.error(e);
    } finally { setSending(false); }
  };

  const handleCreateLink = async () => {
    setCreating(true);
    try {
      const payload = { role: 'member', expires_at: null, max_uses: null, domain_restriction: '' };
      const { data } = await createShareLink(workspaceId, payload);
      setLink(`${origin}/join/${data.token}`);
    } catch (e) {
      console.error(e);
    } finally { setCreating(false); }
  };

  const copy = async ()=>{ try{ await navigator.clipboard.writeText(link);}catch{} };

  const modal = (
    <Backdrop onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}>
      <Card onMouseDown={(e)=>e.stopPropagation()}>
        <Header>
          <h3>Invite to Workspace</h3>
          <button aria-label="Close" onClick={onClose}>×</button>
        </Header>

        <Body>
          {!selected ? (
            <InputShell>
              <EmailInput
                placeholder="Email address or name"
                value={raw}
                onChange={(e)=>setRaw(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); trySelect(); } }}
              />
            </InputShell>
          ) : (
            <Row style={{ alignItems: 'center' }}>
              <PillBox style={{ flex: 1 }}>
                <Pill>
                  {selected.label}
                  <X size={14} onClick={removeSelected} />
                </Pill>
              </PillBox>
              <SendBtn onClick={handleSendInvite} disabled={sending}>
                {sending ? 'Sending…' : 'Send invite'}
              </SendBtn>
            </Row>
          )}

          {selected && (
            <div style={{ marginTop: 12 }}>
              <TextArea
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
                placeholder="Write a personal message (optional)…"
              />
            </div>
          )}

          <Subtle>Invite someone to this Workspace with a link:</Subtle>
          <Row style={{ marginTop: 8 }}>
            <Button onClick={handleCreateLink} disabled={creating}>
              <FiLink /> {creating ? 'Creating…' : 'Create link'}
            </Button>
          </Row>
          {link && (
            <LinkBox>
              <input value={link} readOnly />
              <Primary onClick={copy}>Copy</Primary>
            </LinkBox>
          )}
        </Body>

        <Footer>
          <Button onClick={onClose}>Close</Button>
        </Footer>
      </Card>
    </Backdrop>
  );
  return ReactDOM.createPortal(modal, document.body);
}
