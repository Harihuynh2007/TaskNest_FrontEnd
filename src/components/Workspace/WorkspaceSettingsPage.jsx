import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Spinner, Modal, Form } from 'react-bootstrap';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';
import { AuthContext } from '../../contexts/AuthContext';
import {
  fetchWorkspaceDetails,
  fetchWorkspaceMembers,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  isWorkspaceOwner,
  isWorkspaceAdmin,
} from '../../api/workspaceApi';

const PageContainer = styled.div`
  min-height: calc(100vh - var(--header-height, 56px));
  background: var(--bg-page, #0f1422);
  color: var(--text-primary, #e1e3e6);
  padding: 24px 32px;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary, #a0a8ba);
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
    box-shadow: 0 4px 12px rgba(88, 175, 246, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const TabsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid #262c3a;
  margin-top: 4px;
`;

const TabButton = styled.button`
  border: none;
  background: ${({ $active }) =>
    $active ? 'rgba(88, 175, 246, 0.16)' : 'transparent'};
  color: ${({ $active }) =>
    $active ? '#e1e8ff' : 'var(--text-secondary, #8a93a2)'};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  padding: 10px 16px;
  border-radius: 999px 999px 0 0;
  cursor: pointer;
  position: relative;
  transition: background 0.12s ease, color 0.12s ease;
  

  &:hover {
    background: ${({ $active }) =>
      $active ? 'rgba(88, 175, 246, 0.24)' : 'rgba(255, 255, 255, 0.03)'};
  }

  &::after {
    content: '';
    display: ${({ $active }) => ($active ? 'block' : 'none')};
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: -1px;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, #58aff6, #9b7bff);
  }
`;

const MainCard = styled.div`
  background: var(--bg-elevated, #141925);
  border-radius: 16px;
  padding: 18px 18px 16px;
  border: 1px solid var(--panel-border, #2f3544);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.3fr);
  gap: 18px;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const SectionCard = styled.div`
  background: rgba(9, 13, 24, 0.98);
  border-radius: 14px;
  padding: 14px 14px 12px;
  border: 1px solid #292f3e;
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
  border: 1px solid var(--border-subtle, #2c3444);
  background: #0f1422;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-primary, #e1e3e6);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: var(--brand-primary, #58aff6);
    box-shadow: 0 0 0 2px rgba(88, 175, 246, 0.32);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    border-color: rgba(88, 175, 246, 0.4);
  }
  
  &:focus {
    border-color: var(--brand-primary, #58aff6);
    box-shadow: 0 0 0 3px rgba(88, 175, 246, 0.15); // Tăng từ 2px lên 3px
  }
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
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;

  &:focus {
    border-color: var(--brand-primary, #58aff6);
    box-shadow: 0 0 0 2px rgba(88, 175, 246, 0.32);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SectionActions = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const MutedText = styled.span`
  font-size: 14px;
  color: var(--text-secondary, #8a93a2);
`;

const MembersList = styled.div`
  margin-top: 10px;
  border-radius: 12px;
  border: 1px solid var(--panel-border, #2f3544);
  background: rgba(8, 12, 22, 0.95);
  max-height: 260px;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(88, 175, 246, 0.2);
    border-radius: 3px;
    
    &:hover {
      background: rgba(88, 175, 246, 0.3);
    }
  }
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);

  &:last-child {
    border-bottom: none;
  }
`;

const MemberAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(88, 175, 246, 0.16);
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
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'owner'
        ? 'rgba(255, 214, 102, 0.9)'
        : $variant === 'admin'
        ? 'rgba(88, 175, 246, 0.9)'
        : 'rgba(138, 147, 162, 0.9)'};
  color: ${({ $variant }) =>
    $variant === 'owner'
      ? '#ffd666'
      : $variant === 'admin'
      ? '#58aff6'
      : '#8a93a2'};
  background: ${({ $variant }) =>
    $variant === 'owner'
      ? 'rgba(255, 214, 102, 0.08)'
      : $variant === 'admin'
      ? 'rgba(88, 175, 246, 0.08)'
      : 'rgba(138, 147, 162, 0.08)'};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const DangerCard = styled(SectionCard)`
  border-color: rgba(255, 94, 94, 0.6);
  background: radial-gradient(
      circle at top left,
      rgba(255, 94, 94, 0.16),
      transparent 55%
    ),
    rgba(9, 13, 24, 0.98);
`;

const DangerText = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--text-secondary, #c59a9a);
`;

const Centered = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary, #8a93a2);
`;

function InviteMemberModal({ show, onHide, workspaceId, onInvited }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setSubmitting(true);
      setError('');
      await inviteMember(workspaceId, { email: email.trim(), role });
      if (onInvited) onInvited();
      setEmail('');
      setRole('member');
      onHide();
    } catch (err) {
      setError('Could not invite this email. Please check and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Invite member</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="inviteEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-0" controlId="inviteRole">
            <Form.Label>Role</Form.Label>
            <Form.Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>

          {error && (
            <div className="mt-2">
              <small className="text-danger">{error}</small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={onHide}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={submitting || !email.trim()}
          >
            {submitting ? 'Inviting...' : 'Invite'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default function WorkspaceSettingsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { workspaces, refreshWorkspaces } = useContext(WorkspaceContext);

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('general');

  const [name, setName] = useState('');
  const [boardPolicy, setBoardPolicy] = useState('members');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);

  const userId = user?.id;

  const fallbackWorkspace = useMemo(
    () => workspaces.find((w) => String(w.id) === String(workspaceId)),
    [workspaces, workspaceId]
  );

  const displayName =
    workspace?.name || fallbackWorkspace?.name || 'Workspace';
  const displayInitial = displayName?.charAt(0)?.toUpperCase() || 'W';

  const loadData = async () => {
    try {
      setLoading(true);
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
      setWorkspace(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const isOwnerFlag = useMemo(
    () => (workspace && userId ? isWorkspaceOwner(workspace, userId) : false),
    [workspace, userId]
  );

  const isAdminFlag = useMemo(
    () =>
      members && userId ? isWorkspaceAdmin(members, userId) : false,
    [members, userId]
  );

  const canManage = isOwnerFlag || isAdminFlag;

  const handleSaveProfile = async () => {
    if (!workspace || !name.trim()) return;
    try {
      setSavingProfile(true);
      const res = await updateWorkspace(workspace.id, { name: name.trim() });
      const updated = res?.data || res;
      setWorkspace(updated);
      if (typeof refreshWorkspaces === 'function') {
        refreshWorkspaces();
      }
    } catch (e) {
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePolicy = async () => {
    if (!workspace) return;
    try {
      setSavingPolicy(true);
      const res = await updateWorkspace(workspace.id, {
        board_creation_policy: boardPolicy,
      });
      const updated = res?.data || res;
      setWorkspace(updated);
    } catch (e) {
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspace || !isOwnerFlag) return;
    const confirmed = window.confirm(
      `Delete workspace "${workspace.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteWorkspace(workspace.id);
      if (typeof refreshWorkspaces === 'function') {
        await refreshWorkspaces();
      }
      navigate('/boards');
    } catch (e) {
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenMembersPage = () => {
    navigate(`/w/${workspaceId}/members`);
  };

  const handleInvited = () => {
    loadData();
  };

  if (loading && !workspace && !fallbackWorkspace) {
    return (
      <PageContainer>
        <ContentWrapper>
          <PageHeader>
            <TitleBlock>
              <WorkspaceAvatar>?</WorkspaceAvatar>
              <div>
                <PageTitle>Workspace settings</PageTitle>
                <PageSubtitle>Loading workspace...</PageSubtitle>
              </div>
            </TitleBlock>
          </PageHeader>
          <div style={{ marginTop: 24 }}>
            <Spinner animation="border" size="sm" />
          </div>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (!workspace && !fallbackWorkspace) {
    return (
      <PageContainer>
        <ContentWrapper>
          <PageHeader>
            <TitleBlock>
              <WorkspaceAvatar>!</WorkspaceAvatar>
              <div>
                <PageTitle>Workspace not found</PageTitle>
                <PageSubtitle>
                  This workspace may have been removed or you do not have access.
                </PageSubtitle>
              </div>
            </TitleBlock>
            <TopRightActions>
              <SmallButton
                variant="outline-light"
                onClick={() => navigate('/boards')}
              >
                Back to boards
              </SmallButton>
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
            {canManage ? (
              <Badge>Admin access</Badge>
            ) : (
              <Badge>Read-only</Badge>
            )}
            <SmallButton
              variant="outline-light"
              onClick={() => navigate(`/w/${workspaceId}/boards`)}
            >
              Back to boards
            </SmallButton>
          </TopRightActions>
        </PageHeader>

        <MainCard>
          <TabsBar>
            <TabButton
              type="button"
              $active={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
            >
              General
            </TabButton>
            <TabButton
              type="button"
              $active={activeTab === 'policies'}
              onClick={() => setActiveTab('policies')}
            >
              Policies
            </TabButton>
            <TabButton
              type="button"
              $active={activeTab === 'members'}
              onClick={() => setActiveTab('members')}
            >
              Members
            </TabButton>
            <TabButton
              type="button"
              $active={activeTab === 'danger'}
              onClick={() => setActiveTab('danger')}
            >
              Danger zone
            </TabButton>
          </TabsBar>

          {activeTab === 'general' && (
            <TwoColumnLayout style={{ marginTop: 14 }}>
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
                    <FieldHint>Shown in sidebar and boards</FieldHint>
                  </FieldLabelRow>
                  <TextInput
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!canManage}
                    placeholder="Workspace name"
                  />
                </FieldGroup>

                <SectionActions>
                  {!canManage && (
                    <MutedText>
                      You need admin access to update this workspace.
                    </MutedText>
                  )}
                  <SmallButton
                    variant="primary"
                    onClick={handleSaveProfile}
                    disabled={!canManage || savingProfile || !name.trim()}
                  >
                    {savingProfile ? 'Saving...' : 'Save changes'}
                  </SmallButton>
                </SectionActions>
              </SectionCard>

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
                    {workspace?.owner_display ||
                      'The user who created this workspace.'}
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
                  <SectionDescription>
                    Control who can create new boards inside this workspace.
                  </SectionDescription>
                </SectionHeader>

                <FieldGroup>
                  <FieldLabelRow>
                    <FieldLabel>Who can create boards</FieldLabel>
                  </FieldLabelRow>
                  <Select
                    value={boardPolicy}
                    onChange={(e) => setBoardPolicy(e.target.value)}
                    disabled={!canManage}
                  >
                    <option value="members">All workspace members</option>
                    <option value="admins">Only workspace admins</option>
                    <option value="owner">Only workspace owner</option>
                  </Select>
                </FieldGroup>

                <SectionActions>
                  {!canManage && (
                    <MutedText>
                      Only workspace admins can change this policy.
                    </MutedText>
                  )}
                  <SmallButton
                    variant="primary"
                    onClick={handleSavePolicy}
                    disabled={!canManage || savingPolicy}
                  >
                    {savingPolicy ? 'Saving...' : 'Save policy'}
                  </SmallButton>
                </SectionActions>
              </SectionCard>

              <SectionCard>
                <SectionHeader>
                  <SectionTitle>How it works</SectionTitle>
                  <SectionDescription>
                    The policy is enforced on the backend when users attempt to
                    create new boards.
                  </SectionDescription>
                </SectionHeader>
                <FieldGroup>
                  <FieldLabel>Members</FieldLabel>
                  <MutedText>
                    All workspace members can create boards when this is
                    selected.
                  </MutedText>
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Admins</FieldLabel>
                  <MutedText>
                    Only users with the admin role in this workspace can create
                    boards.
                  </MutedText>
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Owner</FieldLabel>
                  <MutedText>
                    Only the workspace owner can create boards in this
                    workspace.
                  </MutedText>
                </FieldGroup>
              </SectionCard>
            </TwoColumnLayout>
          )}

          {activeTab === 'members' && (
            <TwoColumnLayout style={{ marginTop: 14 }}>
              <SectionCard>
                <SectionHeader>
                  <SectionTitle>Members</SectionTitle>
                  <SectionDescription>
                    View members of this workspace. Use the members page for
                    full role management.
                  </SectionDescription>
                </SectionHeader>

                <SectionActions
                  style={{ justifyContent: 'space-between', marginBottom: 4 }}
                >
                  <SmallButton
                    variant="outline-light"
                    size="sm"
                    onClick={handleOpenMembersPage}
                  >
                    Open members page
                  </SmallButton>
                  <SmallButton
                    variant="primary"
                    size="sm"
                    onClick={() => setInviteOpen(true)}
                  >
                    Invite member
                  </SmallButton>
                </SectionActions>

                {members.length === 0 ? (
                  <Centered style={{ marginTop: 12 }}>
                    <span>No members found for this workspace.</span>
                  </Centered>
                ) : (
                  <MembersList>
                    {members.map((m) => {
                      const u = m.user || {};
                      const initial =
                        (u.full_name && u.full_name.charAt(0)) ||
                        (u.username && u.username.charAt(0)) ||
                        (u.email && u.email.charAt(0)) ||
                        '?';
                      let roleVariant = 'member';
                      const ws = workspace || fallbackWorkspace;
                      if (ws && u.id && isWorkspaceOwner(ws, u.id)) {
                        roleVariant = 'owner';
                      } else if (m.role === 'admin') {
                        roleVariant = 'admin';
                      }
                      const nameLabel =                        u.full_name || u.username || u.email || 'User';
                      return (
                        <MemberRow key={m.id || u.id}>
                          <MemberAvatar>
                            {String(initial).toUpperCase()}
                          </MemberAvatar>
                          <MemberInfo>
                            <MemberName>{nameLabel}</MemberName>
                            {u.email && <MemberEmail>{u.email}</MemberEmail>}
                          </MemberInfo>
                          <RoleTag $variant={roleVariant}>
                            {roleVariant === 'owner'
                              ? 'Owner'
                              : roleVariant === 'admin'
                              ? 'Admin'
                              : 'Member'}
                          </RoleTag>
                        </MemberRow>
                      );
                    })}
                  </MembersList>
                )}
              </SectionCard>

              <SectionCard>
                <SectionHeader>
                  <SectionTitle>Access</SectionTitle>
                  <SectionDescription>
                    Only admins and the owner can invite new members. Use the
                    members page to promote, demote or remove members.
                  </SectionDescription>
                </SectionHeader>
                <FieldGroup>
                  <FieldLabel>Owner</FieldLabel>
                  <MutedText>
                    Full control over workspace, including deleting the
                    workspace.
                  </MutedText>
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Admins</FieldLabel>
                  <MutedText>
                    Can manage members and key workspace settings but cannot
                    delete the workspace.
                  </MutedText>
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Members</FieldLabel>
                  <MutedText>
                    Can collaborate on boards according to board-level
                    permissions.
                  </MutedText>
                </FieldGroup>
              </SectionCard>
            </TwoColumnLayout>
          )}

          {activeTab === 'danger' && (
            <TwoColumnLayout style={{ marginTop: 14 }}>
              <DangerCard>
                <SectionHeader>
                  <SectionTitle>Delete workspace</SectionTitle>
                  <SectionDescription>
                    Permanently delete this workspace and all boards inside it.
                  </SectionDescription>
                </SectionHeader>
                <DangerText>
                  This action cannot be undone. Only the workspace owner can
                  delete it. Consider closing or archiving individual boards
                  instead if you just want to clean up.
                </DangerText>
                <SectionActions>
                  {!isOwnerFlag && (
                    <MutedText>
                      Only the workspace owner can delete this workspace.
                    </MutedText>
                  )}
                  <SmallButton
                    variant="danger"
                    onClick={handleDeleteWorkspace}
                    disabled={!isOwnerFlag || deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete workspace'}
                  </SmallButton>
                </SectionActions>
              </DangerCard>
              <SectionCard>
                <SectionHeader>
                  <SectionTitle>Before you delete</SectionTitle>
                  <SectionDescription>
                    Make sure there is no important data left in this workspace.
                  </SectionDescription>
                </SectionHeader>
                <FieldGroup>
                  <FieldLabel>Back up important boards</FieldLabel>
                  <MutedText>
                    Export or copy boards that contain critical information
                    before deleting the workspace.
                  </MutedText>
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Communicate with your team</FieldLabel>
                  <MutedText>
                    Let workspace members know about the deletion so they are
                    not surprised when boards disappear.
                  </MutedText>
                </FieldGroup>
              </SectionCard>
            </TwoColumnLayout>
          )}
        </MainCard>

        <InviteMemberModal
          show={inviteOpen}
          onHide={() => setInviteOpen(false)}
          workspaceId={workspace?.id || fallbackWorkspace?.id}
          onInvited={handleInvited}
        />      </ContentWrapper>
    </PageContainer>
  );
}
