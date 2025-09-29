// src/components/InviteWorkspaceModal.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FiLink } from 'react-icons/fi';
import { X } from 'react-feather';
import dayjs from 'dayjs';
import { inviteMember, createShareLink } from '../api/workspaceApi';

// =============== styled ===============
const Backdrop = styled.div`
  position: fixed; inset: 0;
  display: grid; place-items: center;
  padding: 16px;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
`;

const Card = styled.div`
  width: min(92vw, 620px);
  max-height: 90vh;
  background: #fff; color: #1f2328;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,.18);
  display: flex; flex-direction: column;
`;

const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  padding: 14px 18px; border-bottom: 1px solid #e6eaef;
  h3{margin:0; font-size:18px; font-weight:600;}
  button{border:0;background:transparent;cursor:pointer;font-size:20px;color:#666;}
`;

const Body = styled.div`
  padding: 16px 18px; overflow:auto;
`;

const Footer = styled.div`
  padding: 12px 18px 16px; border-top: 1px solid #e6eaef;
  display:flex; justify-content:flex-end; gap:8px;
`;

const Row = styled.div`
  display:flex; align-items:center; gap:10px; flex-wrap:wrap;
`;

const InputShell = styled.div`
  position: relative; width: 100%;
`;

const EmailInput = styled.input`
  width: 100%;
  border: 1px solid #d0d7de;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px; outline: none;
  transition: box-shadow .15s, border-color .15s;
  &:focus { border-color:#388bff; box-shadow:0 0 0 3px rgba(56,139,255,.2); }
`;

const PillBox = styled.div`
  width: 100%;
  display:flex; align-items:center; gap:8px;
  border: 1px solid #d0d7de; border-radius: 10px;
  padding: 6px 8px 6px 10px; background:#fff;
`;

const Pill = styled.span`
  display:inline-flex; align-items:center; gap:6px;
  background:#eef6ff; color:#0a66ff;
  border:1px solid #cfe4ff; border-radius: 999px;
  padding: 6px 8px; font-size: 13px; font-weight:600;
  svg{cursor:pointer}
`;

const SendBtn = styled.button`
  margin-left: auto;
  border: 1px solid #28a745; background:#28a745; color:#fff;
  border-radius: 8px; padding: 8px 12px; font-weight:700;
  cursor:pointer;
  &:disabled{opacity:.6; cursor:not-allowed;}
`;

const TextArea = styled.textarea`
  width:100%; min-height: 88px; resize: vertical;
  border:1px solid #d0d7de; border-radius:10px;
  padding: 10px 12px; font-size:14px; outline: none;
  &:focus { border-color:#388bff; box-shadow:0 0 0 3px rgba(56,139,255,.2); }
`;

const Subtle = styled.div`
  margin-top: 14px; font-size: 14px; color: #57606a;
`;

const Button = styled.button`
  border: 1px solid #d0d7de; background:#f6f8fa; color:#111;
  padding: 8px 12px; border-radius: 8px; cursor: pointer;
  display:inline-flex; align-items:center; gap:8px; font-weight:600;
  &:hover{ background:#eef1f4; }
  &:disabled{ opacity:.6; cursor:not-allowed; }
`;

const Primary = styled(Button)`
  background:#0a66ff; border-color:#0a66ff; color:#fff;
  &:hover{ background:#0a58e6; }
`;

const LinkBox = styled.div`
  margin-top: 10px; display:flex; gap:8px;
  input{ flex:1; border:1px solid #d0d7de; border-radius:8px; padding:8px 10px; font-size:13px; }
`;

// =============== helpers ===============
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteWorkspaceModal({
  workspaceId,
  workspaceName = 'Workspace',
  onClose
}) {
  const [raw, setRaw] = useState('');
  const [selected, setSelected] = useState(null); // {label, value} — email hoặc username
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

  // Khi người dùng nhấn Enter trong input:
  const trySelect = () => {
    const v = raw.trim();
    if (!v) return;
    // 1) nếu là email, chấp nhận ngay
    if (emailRegex.test(v)) {
      setSelected({ label: v, value: v, type: 'email' });
      setRaw('');
      return;
    }
    // 2) nếu là username (ví dụ "@tanhaorn"), bỏ @ và chấp nhận
    if (v.startsWith('@') && v.length > 1) {
      setSelected({ label: v, value: v.slice(1), type: 'username' });
      setRaw('');
      return;
    }
    // fallback: coi như email nếu người dùng cố ý
    setSelected({ label: v, value: v, type: 'email' });
    setRaw('');
  };

  const removeSelected = () => setSelected(null);

  const handleSendInvite = async () => {
    if (!selected) return;
    setSending(true);
    try {
      // Trello-like: nếu là username -> BE của bạn có thể map sang email; ở đây ưu tiên email.
      const email = selected.type === 'email' ? selected.value : `${selected.value}@example.com`;
      await inviteMember(workspaceId, {
        email,
        role: 'member',
        // bạn có thể gửi kèm message ở BE; nếu chưa có trường message thì bỏ
        message,
        expires_at: dayjs().add(7, 'day').toISOString()
      });
      // reset
      setSelected(null);
      setMessage('Join this Workspace to start collaborating with me!');
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleCreateLink = async () => {
    setCreating(true);
    try {
      const payload = { role: 'member', expires_at: null, max_uses: null, domain_restriction: '' };
      const { data } = await createShareLink(workspaceId, payload);
      setLink(`${origin}/join/${data.token}`);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const copy = async ()=>{ try{ await navigator.clipboard.writeText(link);}catch{} };

  return (
    <Backdrop onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}>
      <Card onMouseDown={(e)=>e.stopPropagation()}>
        <Header>
          <h3>Invite to Workspace</h3>
          <button aria-label="Close" onClick={onClose}>×</button>
        </Header>

        <Body>
          {/* INPUT KHI CHƯA CHỌN */}
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

          {/* TEXTAREA CHỈ HIỆN KHI ĐÃ CHỌN */}
          {selected && (
            <div style={{ marginTop: 12 }}>
              <TextArea
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
                placeholder="Write a personal message (optional)…"
              />
            </div>
          )}

          {/* SHARE LINK */}
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
}
