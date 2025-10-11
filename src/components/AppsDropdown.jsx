// src/components/AppsDropdown.jsx
import React, { useMemo, useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdApps, MdViewKanban, MdHome, MdPeopleAlt, MdSettings,
  MdInsights, MdExtension, MdAdd, MdNotifications, MdInbox
} from 'react-icons/md';

import BoardThemeDrawer from '../features/boards/BoardThemeDrawer';
import CreateWorkspaceModal from './Workspace/CreateWorkspaceModal';
import InviteWorkspaceModal from './Workspace/InviteWorkspaceModal';
import { WorkspaceContext } from '../contexts/WorkspaceContext';
import * as workspaceApi from '../api/workspaceApi';
import * as boardApi from '../api/boardApi';

/** =========================
 *  CONFIG
 *  ========================= */
const CORE_APPS = [
  { 
    key: 'boards', 
    label: 'Boards', 
    to: '/boards', 
    icon: <MdViewKanban />, 
    accent: 'var(--brand-primary, #5bbcf7)',
    description: 'View all boards'
  },
  { 
    key: 'home', 
    label: 'Home', 
    to: '/home', 
    icon: <MdHome />, 
    accent: '#7c9cff',
    description: 'Dashboard overview'
  },
  { 
    key: 'inbox', 
    label: 'Inbox', 
    to: '/inbox', 
    icon: <MdInbox />, 
    accent: '#f97066',
    description: 'Your inbox cards'
  },
  { 
    key: 'members', 
    label: 'Members', 
    to: '/members', 
    icon: <MdPeopleAlt />, 
    accent: '#78e0b8',
    description: 'Team members'
  },
  { 
    key: 'notifications', 
    label: 'Notifications', 
    to: '/notifications', 
    icon: <MdNotifications />, 
    accent: '#ffa94d',
    description: 'Recent updates'
  },
  { 
    key: 'reports', 
    label: 'Reports', 
    to: '/reports', 
    icon: <MdInsights />, 
    accent: '#f7c56b',
    description: 'Analytics & insights'
  },
  { 
    key: 'settings', 
    label: 'Settings', 
    to: '/settings', 
    icon: <MdSettings />, 
    accent: '#a78bfa',
    description: 'Workspace settings'
  },
];

const INTEGRATIONS = [
  { key: 'slack', label: 'Slack', to: '/integrations/slack' },
  { key: 'github', label: 'GitHub', to: '/integrations/github' },
  { key: 'notion', label: 'Notion', to: '/integrations/notion' },
  { key: 'drive', label: 'Drive', to: '/integrations/drive' }
];

/** =========================
 *  STYLED COMPONENTS
 *  ========================= */
const ToggleBtn = styled(Dropdown.Toggle)`
  background: transparent !important;
  border: 1px solid var(--panel-border, #3a465e) !important;
  padding: 6px 8px !important;
  border-radius: 12px !important;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--header-text, #e6e9ee) !important;
  transition: all 0.2s ease;
  
  &:hover, &:focus {
    background: var(--header-hover, #1b2435) !important;
    color: var(--header-text, #e6e9ee) !important;
    box-shadow: 0 0 0 3px rgba(91, 188, 247, 0.15);
  }
`;

const Panel = styled(Dropdown.Menu)`
  width: min(92vw, 520px);
  padding: 12px;
  background: var(--surface-4, #2c3750);
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  color: var(--text-primary, #e6e9ee);
  z-index: 1300;
  max-height: 90vh;
  overflow-y: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: var(--surface-2, #1b2331);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--panel-border, #3a465e);
    border-radius: 4px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 6px 12px;
`;

const Search = styled.input`
  flex: 1;
  background: var(--search-bg, #162033);
  color: var(--text-primary, #e6e9ee);
  border: 1px solid var(--search-border, var(--panel-border, #3a465e));
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--text-tertiary, #6f7c91);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--search-ring, rgba(91, 188, 247, 0.28));
    border-color: transparent;
  }
`;

const Section = styled.div`
  padding: 8px 6px;
  margin-bottom: 4px;
`;

const Title = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-tertiary, #6f7c91);
  text-transform: uppercase;
  margin: 8px 4px 10px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
`;

const Tile = styled(Link)`
  text-decoration: none;
  background: var(--surface-2, #1b2331);
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 12px;
  padding: 14px;
  color: var(--text-primary, #e6e9ee);
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  transition: transform 0.1s ease, box-shadow 0.2s ease, background 0.2s ease;
  cursor: pointer;

  &:hover {
    background: var(--surface-3, #232d3e);
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.32);
    border-color: var(--brand-primary, #5bbcf7);
  }

  &:active {
    transform: translateY(0);
  }
`;

const IconCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 22px;
  color: #0b1220;
  background: ${p => p.$accent || '#9aa5b5'};
  box-shadow: inset 0 -6px 16px rgba(0, 0, 0, 0.2);
`;

const TileContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Label = styled.div`
  font-weight: 800;
  font-size: 14px;
`;

const Subtle = styled.div`
  font-size: 12px;
  color: var(--text-secondary, #9aa5b5);
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const GhostBtn = styled.button`
  border: 1px solid var(--panel-border, #3a465e);
  background: var(--surface-2, #1b2331);
  color: var(--text-primary, #e6e9ee);
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--surface-3, #232d3e);
    border-color: var(--brand-primary, #5bbcf7);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 16px;
  }
`;

const Footer = styled.div`
  padding: 10px 6px 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-secondary, #9aa5b5);
  font-size: 12px;
  border-top: 1px solid var(--panel-border, #3a465e);
  margin-top: 8px;
`;

const FooterLink = styled(Link)`
  color: var(--brand-primary, #5bbcf7);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;

  &:hover {
    color: var(--brand-secondary, #4aa8e3);
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(249, 112, 102, 0.1);
  border: 1px solid rgba(249, 112, 102, 0.3);
  color: #f97066;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin: 8px 6px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: var(--text-secondary, #9aa5b5);
  font-size: 14px;
`;

/** =========================
 *  COMPONENT
 *  ========================= */
export default function AppsDropdown() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { 
    workspaces, 
    currentWorkspaceId, 
    setCurrentWorkspaceId, 
    refreshWorkspaces 
  } = useContext(WorkspaceContext);

  // Get current workspace object
  const currentWorkspace = useMemo(() => {
    return workspaces.find(w => w.id === currentWorkspaceId) || null;
  }, [workspaces, currentWorkspaceId]);

  // Filter apps based on search query
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return CORE_APPS;
    return CORE_APPS.filter(a => 
      a.label.toLowerCase().includes(t) || 
      a.description.toLowerCase().includes(t)
    );
  }, [q]);

  // Close menu on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('keydown', onKey);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Clear error when menu closes
  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  // Quick action handlers
  const onCreateBoard = () => {
    if (!currentWorkspaceId) {
      setError('Vui lòng chọn Workspace trước khi tạo Board');
      return;
    }
    setOpen(false);
    setShowBoard(true);
  };

  const onCreateWorkspace = () => {
    setOpen(false);
    setShowCreateWs(true);
  };

  const onInviteMembers = () => {
    if (!currentWorkspace?.id) {
      setError('Vui lòng chọn Workspace trước khi mời thành viên');
      return;
    }
    setOpen(false);
    setShowInvite(true);
  };

  // Create workspace handler
  const handleContinueCreateWs = async ({ name, type, description }) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await workspaceApi.createWorkspace({ name, type, description });
        if (data?.id) {
            setCurrentWorkspaceId?.(data.id);
        }
      
      if (data?.id) {
        setCurrentWorkspaceId?.(data.id);
        await refreshWorkspaces?.();
        setShowCreateWs(false);
        setShowInvite(true);
      } else {
        throw new Error('Không nhận được thông tin workspace');
      }
    } catch (err) {
      console.error('Create workspace error:', err);
      const errorMsg = err?.response?.data?.error || 
                      err?.response?.data?.message ||
                      err.message ||
                      'Không thể tạo workspace';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Create board handler
  const handleCreateBoard = async (payload) => {
    if (!currentWorkspaceId) {
      setError('Vui lòng chọn Workspace trước khi tạo Board');
      return;
    }

    setLoading(true);
    setError(null);
    try {
        const res = await boardApi.createBoard(currentWorkspaceId, payload);
        const created = res?.data;
      
      setShowBoard(false);
      
      if (created?.id) {
        navigate(`/workspaces/${currentWorkspaceId}/boards/${created.id}`);
      } else {
        navigate('/boards');
      }
    } catch (err) {
      console.error('Create board error:', err);
      const errorMsg = err?.response?.data?.message || 
                      err?.response?.data?.error ||
                      err.message ||
                      'Không thể tạo board';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to app
  const handleNavigate = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      <Dropdown align="start" show={open} onToggle={setOpen}>
        <ToggleBtn 
          id="apps-menu-toggle" 
          onClick={() => setOpen(v => !v)}
          disabled={loading}
        >
          <MdApps size={20} />
        </ToggleBtn>

        <Panel>
          <HeaderRow>
            <Search 
              placeholder="Tìm kiếm apps..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
            <GhostBtn 
              onClick={onCreateBoard}
              disabled={!currentWorkspaceId || loading}
              title={!currentWorkspaceId ? 'Chọn workspace trước' : 'Tạo board mới'}
            >
              <MdAdd /> New
            </GhostBtn>
          </HeaderRow>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {loading ? (
            <LoadingMessage>Đang xử lý...</LoadingMessage>
          ) : (
            <>
              <Section>
                <Title>Pinned Apps</Title>
                {filtered.length > 0 ? (
                  <Grid>
                    {filtered.map(app => (
                      <Tile 
                        to={app.to} 
                        key={app.key} 
                        onClick={() => setOpen(false)}
                      >
                        <IconCircle $accent={app.accent}>
                          {app.icon}
                        </IconCircle>
                        <TileContent>
                          <Label>{app.label}</Label>
                          <Subtle>{app.description}</Subtle>
                        </TileContent>
                      </Tile>
                    ))}
                  </Grid>
                ) : (
                  <Subtle style={{ padding: '20px', textAlign: 'center' }}>
                    Không tìm thấy app nào
                  </Subtle>
                )}
              </Section>

              <Section>
                <Title>Quick Actions</Title>
                <Row>
                  <GhostBtn 
                    onClick={onCreateBoard}
                    disabled={!currentWorkspaceId}
                    title={!currentWorkspaceId ? 'Chọn workspace trước' : ''}
                  >
                    <MdAdd /> Create board
                  </GhostBtn>
                  <GhostBtn onClick={onCreateWorkspace}>
                    <MdAdd /> Create workspace
                  </GhostBtn>
                  <GhostBtn 
                    onClick={onInviteMembers} 
                    disabled={!currentWorkspace?.id}
                    title={!currentWorkspace?.id ? 'Chọn workspace trước' : ''}
                  >
                    <MdAdd /> Invite members
                  </GhostBtn>
                </Row>
              </Section>

              <Section>
                <Title>Integrations</Title>
                <Row>
                  {INTEGRATIONS.map(it => (
                    <GhostBtn
                      key={it.key}
                      onClick={() => handleNavigate(it.to)}
                      as="button"
                    >
                      <MdExtension /> {it.label}
                    </GhostBtn>
                  ))}
                </Row>
              </Section>

              <Footer>
                <span>TaskNest Apps</span>
                <FooterLink 
                  to="/apps" 
                  onClick={() => setOpen(false)}
                >
                  Manage apps →
                </FooterLink>
              </Footer>
            </>
          )}
        </Panel>
      </Dropdown>

      {/* Modals */}
      <BoardThemeDrawer
        show={showBoard}
        onClose={() => setShowBoard(false)}
        onCreate={handleCreateBoard}
      />

      {showCreateWs && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateWs(false)}
          onContinue={handleContinueCreateWs}
        />
      )}

      {showInvite && currentWorkspace?.id && (
        <InviteWorkspaceModal
          workspaceId={currentWorkspace.id}
          workspaceName={currentWorkspace.name}
          onClose={() => setShowInvite(false)}
        />
      )}
    </>
  );
}