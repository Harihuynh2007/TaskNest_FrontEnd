import React, { useEffect, useMemo, useState, useRef } from 'react';
import styled from 'styled-components';
import { FiLink } from 'react-icons/fi';
import { X, Check } from 'react-feather'; // Thêm icon Check cho trạng thái Copied
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

// Styled cho tất cả các loại input/select để đồng bộ hóa
const StyledFormElement = styled.input`
  width: 100%;
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px; outline: none;
  background: var(--surface-2, #1b2331);
  color: var(--text-primary, #e6e9ee);
  transition: box-shadow .15s, border-color .15s;
  &:focus { border-color: transparent; box-shadow: 0 0 0 3px var(--ring, rgba(91,188,247,.38)); }

  // Style đặc biệt cho các input[type="date"]
  &[type="date"] {
    appearance: none; // Tắt style mặc định của browser
    // icon mũi tên xuống cho input type date (nếu muốn)
    // background: var(--surface-2, #1b2331) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239aa5b5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E") no-repeat right 10px center;
    // background-size: 12px;
  }
`;

const EmailInput = styled(StyledFormElement)``; // Kế thừa từ StyledFormElement

const Select = styled(StyledFormElement).attrs({ as: 'select' })`
  padding-right: 28px; // Tạo không gian cho mũi tên dropdown mặc định
  appearance: none; // Tắt mũi tên mặc định trên một số browser
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239aa5b5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;

  // Fix cho Firefox để hiển thị mũi tên dropdown
  &::-ms-expand { display: none; }
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
  svg{cursor:pointer; margin-left: 4px; color: var(--text-secondary); } // Tinh chỉnh màu và khoảng cách X
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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteWorkspaceModal({ workspaceId, workspaceName = 'Workspace', onClose }) {
  const [raw, setRaw] = useState('');
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('Join this Workspace to start collaborating with me!');
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState('member');
  const [expiry, setExpiry] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [domain, setDomain] = useState('');

  const inputRef = useRef(null);
  const origin = useMemo(() => window.location.origin, []);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e)=>{ if(e.key==='Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return ()=>{
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    }
  }, [onClose]);

  const trySelect = () => {
    const v = raw.trim();
    if (!v) return;
    if (emailRegex.test(v)) { setSelected({ label: v, value: v, type: 'email' }); setRaw(''); return; }
    if (v.startsWith('@') && v.length > 1) { setSelected({ label: v, value: v.slice(1), type: 'username' }); setRaw(''); return; }
    setSelected({ label: v, value: v, type: 'email' }); setRaw(''); // Mặc định là email nếu không phải username hợp lệ
  };

  const removeSelected = () => setSelected(null);

  const handleSendInvite = async () => {
    if (!selected) return;
    setSending(true);
    try {
      // Giữ nguyên logic cũ, thêm domain restriction nếu có (dù không được dùng cho email invite)
      const email = selected.type === 'email' ? selected.value : `${selected.value}@example.com`;
      await inviteMember(workspaceId, {
        email,
        role,
        message,
        expires_at: expiry ? dayjs(expiry).toISOString() : null
      });
      // Reset form sau khi gửi thành công
      setSelected(null);
      setRaw(''); // Đảm bảo input email trống rỗng
      setMessage('Join this Workspace to start collaborating with me!');
      setExpiry('');
      setRole('member');
    } catch (e) {
      console.error(e);
      // TODO: Thêm thông báo lỗi cho người dùng
    } finally { setSending(false); }
  };

  const handleCreateLink = async () => {
    setCreating(true);
    setCopied(false);
    try {
      const payload = {
        role,
        expires_at: expiry ? dayjs(expiry).toISOString() : null,
        max_uses: maxUses ? parseInt(maxUses) : null,
        domain_restriction: domain || ''
      };
      const { data } = await createShareLink(workspaceId, payload);
      setLink(`${origin}/join/${data.token}`);
    } catch (e) {
      console.error(e);
      // TODO: Thêm thông báo lỗi cho người dùng
    } finally { setCreating(false); }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      // Tắt trạng thái copied sau một thời gian
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
      // TODO: Thêm thông báo lỗi cho người dùng
    }
  };

  const modal = (
    <Backdrop onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}>
      <Card onMouseDown={(e)=>e.stopPropagation()}>
        <Header>
          <h3>Invite to {workspaceName}</h3> {/* Tùy biến tiêu đề */}
          <button aria-label="Close" onClick={onClose}><X size={20}/></button> {/* Dùng icon X thay vì 'x' */}
        </Header>
        <Body>
          {!selected ? (
            <InputShell>
              <EmailInput
                ref={inputRef}
                placeholder="Email address or name"
                value={raw}
                onChange={(e)=>setRaw(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); trySelect(); } }}
              />
            </InputShell>
          ) : (
            <Row>
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
            <TextArea
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
              placeholder="Write a personal message (optional)…"
            />
          )}

          <Subtle style={{ marginTop: 18 }}>Or generate a reusable invite link:</Subtle>

          <Row style={{ flexWrap: 'wrap', gap: 10 }}>
            {/* Sử dụng StyledFormElement và Select cho các controls dưới đây */}
            <Select value={role} onChange={(e) => setRole(e.target.value)} style={{ flex: 1, minWidth: '120px' }}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="observer">Observer</option>
            </Select>
            <StyledFormElement type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} style={{ flex: 1, minWidth: '140px' }} />
            <StyledFormElement type="number" min="1" placeholder="Max Uses" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} style={{ flex: 1, minWidth: '100px' }} />
            <StyledFormElement type="text" placeholder="Domain (optional)" value={domain} onChange={(e) => setDomain(e.target.value)} style={{ flex: 1, minWidth: '140px' }} />
          </Row>

          <Row>
            <Button onClick={handleCreateLink} disabled={creating}>
              <FiLink /> {creating ? 'Creating…' : 'Create link'}
            </Button>
          </Row>

          {link && (
            <LinkBox>
              <input value={link} readOnly />
              <Primary onClick={copy}>
                {copied ? <><Check size={18} /> Copied</> : 'Copy'}
              </Primary>
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