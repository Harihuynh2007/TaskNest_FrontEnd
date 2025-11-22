import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { Button, Spinner, Modal, Form } from 'react-bootstrap';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';
import { AuthContext } from '../../contexts/AuthContext';
import {
  fetchWorkspaceDetails, fetchWorkspaceMembers, updateWorkspace,
  deleteWorkspace, inviteMember, isWorkspaceOwner, isWorkspaceAdmin,
} from '../../api/workspaceApi';

// ═══════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// ═══════════════════════════════════════════════════════════════════
// STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════════════
const PageContainer = styled.div`
  min-height: calc(100vh - var(--header-height, 56px));
  background: var(--bg-page, #0f1422);
  color: var(--text-primary, #e1e3e6);
  padding: 24px 32px;
  display: flex;
  justify-content: center;
  @media (max-width: 768px) { padding: 16px; }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${fadeIn} 0.3s ease;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const TitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WorkspaceAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #58aff6 0%, #3a7bd5 50%, #5c4acb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  color: #fff;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary, #e1e3e6);
`;

const PageSubtitle = styled.p`
  margin: 2px 0 0;
  font-size: 14px;
  color: var(--text-secondary, #8a93a2);
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $variant }) => $variant === 'success' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255,255,255,0.05)'};
  border: 1px solid ${({ $variant }) => $variant === 'success' ? 'rgba(82,196,26,0.4)' : 'rgba(255,255,255,0.1)'};
  color: ${({ $variant }) => $variant === 'success' ? '#52c41a' : 'var(--text-secondary, #a0a8ba)'};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const TopRightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SmallButton = styled(Button)`
  font-size: 14px;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(88,175,246,0.2);
  }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const TabsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid #262c3a;
  margin-top: 4px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const TabButton = styled.button`
  border: none;
  background: ${({ $active }) => $active ? 'rgba(88,175,246,0.16)' : 'transparent'};
  color: ${({ $active }) => $active ? '#e1e8ff' : 'var(--text-secondary, #8a93a2)'};
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 600 : 500};
  padding: 10px 16px;
  border-radius: 999px 999px 0 0;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
  white-space: nowrap;
  &:hover { background: ${({ $active }) => $active ? 'rgba(88,175,246,0.24)' : 'rgba(255,255,255,0.03)'}; }
  &::after {
    content: '';
    display: ${({ $active }) => $active ? 'block' : 'none'};
    position: absolute;
    left: 12px; right: 12px; bottom: -1px;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, #58aff6, #9b7bff);
  }
`;

const MainCard = styled.div`
  background: var(--bg-elevated, #141925);
  border-radius: 16px;
  padding: 18px;
  border: 1px solid var(--panel-border, #2f3544);
  box-shadow: 0 12px 32px rgba(0,0,0,0.35);
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0,1.8fr) minmax(0,1.3fr);
  gap: 18px;
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`;

const SectionCard = styled.div`
  background: rgba(9,13,24,0.98);
  border-radius: 14px;
  padding: 14px;
  border: 1px solid #292f3e;
  animation: ${fadeIn} 0.25s ease;
`;

const SectionHeader = styled.div`
  margin-bottom: 8px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #e1e3e6);
`;

const SectionDescription = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary, #8a93a2);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
`;

const FieldLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
`;

const FieldLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #8a93a2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FieldHint = styled.span`
  font-size: 11px;
  color: var(--text-secondary, #8a93a2);
`;

const TextInput = styled.input`
  width: 100%;
  border-radius: 10px;
  border: 1px solid ${({ $error }) => $error ? '#ff5e5e' : 'var(--border-subtle, #2c3444)'};
  background: #0f1422;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-primary, #e1e3e6);
  outline: none;
  transition: all 0.15s ease;
  ${({ $error }) => $error && css`animation: ${shake} 0.3s ease;`}
  &:focus {
    border-color: ${({ $error }) => $error ? '#ff5e5e' : 'var(--brand-primary, #58aff6)'};
    box-shadow: 0 0 0 3px ${({ $error }) => $error ? 'rgba(255,94,94,0.15)' : 'rgba(88,175,246,0.15)'};
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &:hover:not(:disabled):not(:focus) { border-color: rgba(88,175,246,0.4); }
`;

const Select = styled.select`
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--border-subtle, #2c3444);
  background: #0f1422;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-primary, #e1e3e6);
  outline: none;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #8a93a2 50%),
    linear-gradient(135deg, #8a93a2 50%, transparent 50%);
  background-position: calc(100% - 14px) 11px, calc(100% - 9px) 11px;
  background-size: 5px 5px;
  background-repeat: no-repeat;
  &:focus {
    border-color: var(--brand-primary, #58aff6);
    box-shadow: 0 0 0 3px rgba(88,175,246,0.15);
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const SectionActions = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const MutedText = styled.span`
  font-size: 14px;
  color: var(--text-secondary, #8a93a2);
`;

const ErrorText = styled.span`
  font-size: 13px;
  color: #ff5e5e;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SuccessText = styled.span`
  font-size: 13px;
  color: #52c41a;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MembersList = styled.div`
  margin-top: 10px;
  border-radius: 12px;
  border: 1px solid var(--panel-border, #2f3544);
  background: rgba(8,12,22,0.95);
  max-height: 260px;
  overflow: auto;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(88,175,246,0.2);
    border-radius: 3px;
    &:hover { background: rgba(88,175,246,0.3); }
  }
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  gap: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  &:last-child { border-bottom: none; }
`;

const MemberAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(88,175,246,0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #dce7ff;
`;

const MemberInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const MemberName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #e1e3e6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MemberEmail = styled.span`
  font-size: 14px;
  color: var(--text-secondary, #8a93a2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RoleTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid ${({ $variant }) =>
    $variant === 'owner' ? 'rgba(255,214,102,0.9)' :
    $variant === 'admin' ? 'rgba(88,175,246,0.9)' : 'rgba(138,147,162,0.9)'};
  color: ${({ $variant }) =>
    $variant === 'owner' ? '#ffd666' :
    $variant === 'admin' ? '#58aff6' : '#8a93a2'};
  background: ${({ $variant }) =>
    $variant === 'owner' ? 'rgba(255,214,102,0.08)' :
    $variant === 'admin' ? 'rgba(88,175,246,0.08)' : 'rgba(138,147,162,0.08)'};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const DangerCard = styled(SectionCard)`
  border-color: rgba(255,94,94,0.6);
  background: radial-gradient(circle at top left, rgba(255,94,94,0.16), transparent 55%), rgba(9,13,24,0.98);
`;

const DangerText = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  color: #c59a9a;
`;

const Centered = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary, #8a93a2);
  padding: 16px;
`;

const SkeletonBox = styled.div`
  background: linear-gradient(90deg, #1a2030 25%, #242d40 50%, #1a2030 75%);
  background-size: 200% 100%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  border-radius: ${({ $radius }) => $radius || '8px'};
  height: ${({ $height }) => $height || '40px'};
  width: ${({ $width }) => $width || '100%'};
`;

const Toast = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease;
  background: ${({ $type }) => $type === 'error' ? '#ff5e5e' : '#52c41a'};
  color: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
`;

// ═══════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ═══════════════════════════════════════════════════════════════════
const useToast = () => {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, showToast };
};

const useValidation = (rules) => {
  const [errors, setErrors] = useState({});
  const validate = useCallback((field, value) => {
    const rule = rules[field];
    if (!rule) return true;
    const error = rule(value);
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, [rules]);
  const clearError = useCallback((field) => {
    setErrors(prev => ({ ...prev, [field]: null }));
  }, []);
  return { errors, validate, clearError, setErrors };
};

// ═══════════════════════════════════════════════════════════════════
// INVITE MEMBER MODAL
// ═══════════════════════════════════════════════════════════════════
function InviteMemberModal({ show, onHide, workspaceId, onInvited }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await inviteMember(workspaceId, { email: email.trim(), role });
      onInvited?.();
      setEmail('');
      setRole('member');
      onHide();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Could not invite. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('member');
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Invite member</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              isInvalid={!!error && error.includes('email')}
              autoFocus
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Role</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
          {error && <div className="mt-3"><small className="text-danger">{error}</small></div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" size="sm" type="submit" disabled={submitting || !email.trim()}>
            {submitting ? <><Spinner size="sm" className="me-1" />Inviting...</> : 'Invite'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function WorkspaceSettingsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { workspaces, refreshWorkspaces } = useContext(WorkspaceContext);

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState('');
  const [boardPolicy, setBoardPolicy] = useState('members');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { toast, showToast } = useToast();
  const { errors, validate, clearError } = useValidation({
    name: (v) => !v?.trim() ? 'Name is required' : v.trim().length < 2 ? 'Min 2 characters' : v.trim().length > 50 ? 'Max 50 characters' : null,
  });

  const userId = user?.id;
  const fallbackWorkspace = useMemo(() => workspaces.find(w => String(w.id) === String(workspaceId)), [workspaces, workspaceId]);
  const displayName = workspace?.name || fallbackWorkspace?.name || 'Workspace';
  const displayInitial = displayName?.charAt(0)?.toUpperCase() || 'W';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [wsRes, memRes] = await Promise.all([
        fetchWorkspaceDetails(workspaceId),
        fetchWorkspaceMembers(workspaceId),
      ]);
      const ws = wsRes?.data || wsRes;
      const mem = memRes?.data || memRes;
      setWorkspace(ws);
      setMembers(Array.isArray(mem) ? mem : []);
      setName(ws?.name || '');
      setBoardPolicy(ws?.board_creation_policy || 'members');
    } catch (e) {
      setLoadError(e?.response?.data?.message || 'Failed to load workspace data.');
      setWorkspace(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { loadData(); }, [loadData]);

  const isOwnerFlag = useMemo(() => workspace && userId ? isWorkspaceOwner(workspace, userId) : false, [workspace, userId]);
  const isAdminFlag = useMemo(() => members && userId ? isWorkspaceAdmin(members, userId) : false, [members, userId]);
  const canManage = isOwnerFlag || isAdminFlag;

  const handleSaveProfile = async () => {
    if (!validate('name', name)) return;
    try {
      setSavingProfile(true);
      const res = await updateWorkspace(workspace.id, { name: name.trim() });
      const updated = res?.data || res;
      setWorkspace(updated);
      refreshWorkspaces?.();
      showToast('Profile saved successfully');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePolicy = async () => {
    try {
      setSavingPolicy(true);
      const res = await updateWorkspace(workspace.id, { board_creation_policy: boardPolicy });
      setWorkspace(res?.data || res);
      showToast('Policy updated successfully');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to update policy', 'error');
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!window.confirm(`Delete "${workspace.name}"? This cannot be undone.`)) return;
    try {
      setDeleting(true);
      await deleteWorkspace(workspace.id);
      await refreshWorkspaces?.();
      navigate('/boards');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to delete workspace', 'error');
      setDeleting(false);
    }
  };

  // Loading State
  if (loading && !workspace && !fallbackWorkspace) {
    return (
      <PageContainer>
        <ContentWrapper>
          <PageHeader>
            <TitleBlock>
              <SkeletonBox $width="40px" $height="40px" $radius="10px" />
              <div>
                <SkeletonBox $width="180px" $height="22px" />
                <SkeletonBox $width="120px" $height="14px" style={{ marginTop: 6 }} />
              </div>
            </TitleBlock>
          </PageHeader>
          <MainCard>
            <SkeletonBox $height="200px" $radius="12px" />
          </MainCard>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // Error State
  if (loadError || (!workspace && !fallbackWorkspace)) {
    return (
      <PageContainer>
        <ContentWrapper>
          <PageHeader>
            <TitleBlock>
              <WorkspaceAvatar>!</WorkspaceAvatar>
              <div>
                <PageTitle>{loadError ? 'Error loading workspace' : 'Workspace not found'}</PageTitle>
                <PageSubtitle>{loadError || 'This workspace may have been removed.'}</PageSubtitle>
              </div>
            </TitleBlock>
            <TopRightActions>
              <SmallButton variant="outline-light" onClick={loadData}>Retry</SmallButton>
              <SmallButton variant="outline-light" onClick={() => navigate('/boards')}>Back to boards</SmallButton>
            </TopRightActions>
          </PageHeader>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader>
          <TitleBlock>
            <WorkspaceAvatar>{displayInitial}</WorkspaceAvatar>
            <div>
              <PageTitle>Workspace settings</PageTitle>
              <PageSubtitle>{displayName}</PageSubtitle>
            </div>
          </TitleBlock>
          <TopRightActions>
            <Badge $variant={canManage ? 'success' : undefined}>{canManage ? 'Admin access' : 'Read-only'}</Badge>
            <SmallButton variant="outline-light" onClick={() => navigate(`/w/${workspaceId}/boards`)}>Back to boards</SmallButton>
          </TopRightActions>
        </PageHeader>

        <MainCard>
          <TabsBar>
            {['general', 'policies', 'members', 'danger'].map(tab => (
              <TabButton key={tab} type="button" $active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('danger', 'Danger zone')}
              </TabButton>
            ))}
          </TabsBar>

          {activeTab === 'general' && (
            <TwoColumnLayout style={{ marginTop: 14 }}>
              {/* ========== LEFT COLUMN: Workspace Profile ========== */}
              <SectionCard>
                <SectionHeader>
                  <SectionTitle>Workspace profile</SectionTitle>
                  <SectionDescription>
                    Update the name of this workspace. Only admins and the owner
                    can edit these settings.
                  </SectionDescription>
                </SectionHeader>

                <FieldGroup>
                  <FieldLabelRow>
                    <FieldLabel>Name</FieldLabel>
                    <FieldHint>{name.trim().length}/50</FieldHint>
                  </FieldLabelRow>
                  <TextInput
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError('name');
                    }}
                    onBlur={() => validate('name', name)}
                    disabled={!canManage}
                    placeholder="Workspace name"
                    $error={!!errors.name}
                    maxLength={50}
                  />
                  {errors.name && <ErrorText>⚠ {errors.name}</ErrorText>}
                </FieldGroup>

                <SectionActions>
                  {!canManage && (
                    <MutedText>You need admin access to update this workspace.</MutedText>
                  )}
                  <SmallButton
                    variant="primary"
                    onClick={handleSaveProfile}
                    disabled={!canManage || savingProfile || !name.trim() || !!errors.name}
                  >
                    {savingProfile ? (
                      <>
                        <Spinner size="sm" className="me-1" />
                        Saving...
                      </>
                    ) : (
                      'Save changes'
                    )}
                  </SmallButton>
                </SectionActions>
              </SectionCard>

              {/* ========== RIGHT COLUMN: Overview ========== */}
              <SectionCard>
                <SectionHeader>
                  <SectionTitle>Overview</SectionTitle>
                  <SectionDescription>
                    Basic information about this workspace.
                  </SectionDescription>
                </SectionHeader>

                <FieldGroup>
                  <FieldLabel>Owner</FieldLabel>
                  <MutedText>
                    {workspace?.owner_display || 'The user who created this workspace.'}
                  </MutedText>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Members</FieldLabel>
                  <MutedText>
                    {members.length} member{members.length !== 1 ? 's' : ''} in this workspace.
                  </MutedText>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Boards</FieldLabel>
                  <MutedText>
                    Manage boards from the boards page of this workspace.
                  </MutedText>
                </FieldGroup>
              </SectionCard>
            </TwoColumnLayout>
          )}

          {activeTab === 'policies' && (
            <TwoColumnLayout style={{ marginTop: 14 }}>
              <SectionCard>
                <SectionHeader>
                  <SectionTitle>Board creation policy</SectionTitle>
                  <SectionDescription>Control who can create new boards.</SectionDescription>
                </SectionHeader>
                <FieldGroup>
                  <FieldLabel>Who can create boards</FieldLabel>
                  <Select value={boardPolicy} onChange={(e) => setBoardPolicy(e.target.value)} disabled={!canManage}>
                    <option value="members">All workspace members</option>
                    <option value="admins">Only workspace admins</option>
                    <option value="owner">Only workspace owner</option>
                  </Select>
                </FieldGroup>
                <SectionActions>
                  {!canManage && <MutedText>Admin access required</MutedText>}
                  <SmallButton variant="primary" onClick={handleSavePolicy} disabled={!canManage || savingPolicy}>
                    {savingPolicy ? <><Spinner size="sm" className="me-1" />Saving...</> : 'Save policy'}
                  </SmallButton>
                </SectionActions>
              </SectionCard>
              <SectionCard>
                <SectionHeader>
                  <SectionTitle>Policy options</SectionTitle>
                  <SectionDescription>Choose the right level of control.</SectionDescription>
                </SectionHeader>
                <FieldGroup><FieldLabel>Members</FieldLabel><MutedText>Everyone can create boards freely.</MutedText></FieldGroup>
                <FieldGroup><FieldLabel>Admins</FieldLabel><MutedText>Only admins and owner can create.</MutedText></FieldGroup>
                <FieldGroup><FieldLabel>Owner</FieldLabel><MutedText>Most restrictive - owner only.</MutedText></FieldGroup>
              </SectionCard>
            </TwoColumnLayout>
          )}

          {activeTab === 'members' && (
            <TwoColumnLayout style={{ marginTop: 14 }}>
              <SectionCard>
                <SectionHeader>
                  <SectionTitle>Members ({members.length})</SectionTitle>
                  <SectionDescription>View and manage workspace members.</SectionDescription>
                </SectionHeader>
                <SectionActions style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                  <SmallButton variant="outline-light" size="sm" onClick={() => navigate(`/w/${workspaceId}/members`)}>Manage members</SmallButton>
                  {canManage && <SmallButton variant="primary" size="sm" onClick={() => setInviteOpen(true)}>+ Invite</SmallButton>}
                </SectionActions>
                {members.length === 0 ? (
                  <Centered>No members found</Centered>
                ) : (
                  <MembersList>
                    {members.map((m) => {
                      const u = m.user || {};
                      const initial = (u.full_name?.[0] || u.username?.[0] || u.email?.[0] || '?').toUpperCase();
                      const ws = workspace || fallbackWorkspace;
                      const roleVariant = ws && u.id && isWorkspaceOwner(ws, u.id) ? 'owner' : m.role === 'admin' ? 'admin' : 'member';
                      return (
                        <MemberRow key={m.id || u.id}>
                          <MemberAvatar>{initial}</MemberAvatar>
                          <MemberInfo>
                            <MemberName>{u.full_name || u.username || u.email || 'User'}</MemberName>
                            {u.email && <MemberEmail>{u.email}</MemberEmail>}
                          </MemberInfo>
                          <RoleTag $variant={roleVariant}>{roleVariant}</RoleTag>
                        </MemberRow>
                      );
                    })}
                  </MembersList>
                )}
              </SectionCard>
              <SectionCard>
                <SectionHeader>
                  <SectionTitle>Roles explained</SectionTitle>
                  <SectionDescription>Different permission levels.</SectionDescription>
                </SectionHeader>
                <FieldGroup><FieldLabel>Owner</FieldLabel><MutedText>Full control including deletion.</MutedText></FieldGroup>
                <FieldGroup><FieldLabel>Admin</FieldLabel><MutedText>Manage members and settings.</MutedText></FieldGroup>
                <FieldGroup><FieldLabel>Member</FieldLabel><MutedText>Collaborate on boards.</MutedText></FieldGroup>
              </SectionCard>
            </TwoColumnLayout>
          )}

          {activeTab === 'danger' && (
            <TwoColumnLayout style={{ marginTop: 14 }}>
              <DangerCard>
                <SectionHeader>
                  <SectionTitle>⚠️ Delete workspace</SectionTitle>
                  <SectionDescription>Permanently delete this workspace and all boards.</SectionDescription>
                </SectionHeader>
                <DangerText>This action cannot be undone. All boards, cards, and data will be permanently removed.</DangerText>
                <SectionActions>
                  {!isOwnerFlag && <MutedText>Only the owner can delete</MutedText>}
                  <SmallButton variant="danger" onClick={handleDeleteWorkspace} disabled={!isOwnerFlag || deleting}>
                    {deleting ? <><Spinner size="sm" className="me-1" />Deleting...</> : 'Delete workspace'}
                  </SmallButton>
                </SectionActions>
              </DangerCard>
              <SectionCard>
                <SectionHeader>
                  <SectionTitle>Before deleting</SectionTitle>
                  <SectionDescription>Important considerations.</SectionDescription>
                </SectionHeader>
                <FieldGroup><FieldLabel>Export data</FieldLabel><MutedText>Back up important boards first.</MutedText></FieldGroup>
                <FieldGroup><FieldLabel>Notify team</FieldLabel><MutedText>Let members know before deleting.</MutedText></FieldGroup>
              </SectionCard>
            </TwoColumnLayout>
          )}
        </MainCard>

        <InviteMemberModal show={inviteOpen} onHide={() => setInviteOpen(false)} workspaceId={workspace?.id || fallbackWorkspace?.id} onInvited={loadData} />
        {toast && <Toast $type={toast.type}>{toast.msg}</Toast>}
      </ContentWrapper>
    </PageContainer>
  );
}