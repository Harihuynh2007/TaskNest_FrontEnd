import React, { useEffect, useMemo, useRef, useState} from 'react';
import styled from 'styled-components';
import { FiLink } from 'react-icons/fi';
import dayjs from 'dayjs';

import { createShareLink } from '../api/workspaceApi';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 16px;
`;

const ModalCard = styled.div`
  width: min(92vw, 560px);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0,0,0,0.16);
  color: #222;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    font-size: 18px;
    margin: 0;
    font-weight: 600;
  }
  button {
    border: none;
    background: transparent;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    color: #555;
  }
`;

const Body = styled.div`
  padding: 16px 20px;
  overflow: auto;
`;

const Footer = styled.div`
  padding: 12px 20px 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 10px 12px;
  outline: none;
  font-size: 14px;
  &:focus {
    border-color: #388bff;
    box-shadow: 0 0 0 3px rgba(56,139,255,0.2);
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Subtle = styled.div`
  margin-top: 16px;
  font-size: 14px;
  color: #555;
`;

const Button = styled.button`
  border: 1px solid #d0d7de;
  background: #f6f8fa;
  color: #111;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;

  &:hover { background: #eef1f4; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Primary = styled(Button)`
  background: #0a66ff;
  border-color: #0a66ff;
  color: #fff;
  &:hover { background: #0a58e6; }
`;

const LinkBox = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    font-size: 13px;
    padding: 8px 10px;
    border: 1px solid #d0d7de;
    border-radius: 8px;
  }
`;

export default function InviteWorkspaceModal({
    workspaceId,
    onClose,
    onCreatedLink,
    workspaceName = 'workspace'
}) {

    const dialogRef = useRef(null);
    const [email, setEmail] = useState('');
    const [creating, setCreating] = useState(false);
    const [link, setLink] = useState('');
    const origin = useMemo(() => window.location.origin, []);

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey); 
       }, [onClose]);

    const onBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose?.();
    };

    const handleCreateLink = async () => {
        setCreating(true);
        try {
        // MVP: tạo link role=member, không bắt buộc expiry
        const payload = { role: 'member', expires_at: null, max_uses: null, domain_restriction: '' };
        const { data } = await createShareLink(workspaceId, payload);
        const url = `${origin}/join/${data.token}`;
        setLink(url);
        onCreatedLink?.(data);
        } catch (err) {
        // có thể show toast ở ngoài, để đơn giản mình log
        console.error(err);
        } finally {
        setCreating(false);
        }
    };

    const copy = async () => {
        try{ await navigator.clipboard.writeText(link);} catch {}
    };

    return (
        <Backdrop onMouseDown={onBackdropClick}>
            <ModalCard ref={dialogRef} onMouseDown={(e) => e.stopPropagation()}>
                <Header>
                <h3>Invite to Workspace</h3>
                <button aria-label="Close" onClick={onClose}>×</button>
                </Header>

                <Body>
                <Row>
                    <Input
                    placeholder="Email address or name"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </Row>

                <Subtle>
                    Invite someone to this Workspace with a link:
                </Subtle>

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
            </ModalCard>
        </Backdrop>
    );
}