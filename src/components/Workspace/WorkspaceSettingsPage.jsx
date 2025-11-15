// src/features/workspace/WorkspaceSettingsPage.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Spinner, Button } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';
import {
  fetchWorkspaceDetails,
  fetchWorkspaceMembers,
  updateWorkspace,
  deleteWorkspace,
  isWorkspaceAdmin,
  isWorkspaceOwner,
} from '../../api/workspaceApi';
import InviteWorkspaceModal from '../../components/Workspace/InviteWorkspaceModal';

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
  gap: 24px;
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
  background: var(--brand-gradient, linear-gradient(135deg,#58aff6 0%, #3a7bd5 100%));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  color: #fff;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary, #e1e3e6);
`;

const PageSubtitle = styled.p`
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--text-secondary, #8a93a2);
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary, #8a93a2);
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1.3fr);
  gap: 20px;

  @media (max-width: 992px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const SectionCard = styled.div`
  background: var(--bg-elevated, #141925);
  border-radius: 16px;
  padding: 18px 18px 16px;
  border: 1px solid var(--panel-border, #2f3544);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
`;

const SectionHeader = styled.div`
  margin-bottom: 10px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #e1e3e6);
`;

const SectionDescription = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
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
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #8a93a2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
  padding: 8px 10px;
  font-size: 13px;
  color: var(--text-primary, #e1e3e6);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: var(--brand-primary, #58aff6);
    box-shadow: 0 0 0 2px rgba(88, 175, 246, 0.32);
  }
`;

const Select = styled.select`
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--border-subtle, #2c3444);
  background: #0f1422;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--text-primary, #e1e3e6);
  outline: none;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #8a93a2 50%), linear-gradient(135deg, #8a93a2 50%, transparent 50%);
  background-position: calc(100% - 14px) 11px, calc(100% - 9px) 11px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;

  &:focus {
    border-color: var(--brand-primary, #58aff6);
    box-shadow: 0 0 0 2px rgba(88, 175, 246, 0.32);
  }
`;

const SectionActions = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const MutedText = styled.span`
  font-size: 12px;
  color: var(--text-secondary, #8a93a2);
`;

const MembersList = styled.div`
  margin-top: 10px;
  border-radius: 12px;
  border: 1px solid var(--panel-border, #2f3544);
  background: rgba(8, 12, 22, 0.9);
  max-height: 280px;
  overflow: auto;
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
  font-size: 13px;
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
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #e1e3e6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MemberEmail = styled.span`
  font-size: 12px;
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
  background: radial-gradient(circle at top left, rgba(255, 94, 94, 0.18), transparent 55%), var(--bg-elevated, #141925);
`;

const DangerText = styled.p`
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-secondary, #c59a9a);
`;

const TopRightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LinkButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  font-size: 12px;
  color: var(--brand-primary, #58aff6);
  cursor: pointer;
  text-decoration: underline;
`;

const SmallButton = styled(Button)`
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
`;

export default function WorkspaceSettingsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { workspaces, refreshWorkspaces } = useContext(WorkspaceContext);

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState('');
  const [boardPolicy, setBoardPolicy] = useState('members');
  const [showInvite, setShowInvite] = useState(false);

  const userId = user?.id;

  const fallbackWorkspace = useMemo(
    () => workspaces.find(w => String(w.id) === String(workspaceId)),
    [workspaces, workspaceId]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [wsRes, membersRes] = await Promise.all([
        fetchWorkspaceDetails(workspaceId),
        fetchWorkspaceMembers(workspaceId),
      ]);
      const ws = wsRes?.data || wsRes;
      const mem = membersRes?.data || membersRes;
      setWorkspace(ws);
      setMembers(Array.isArray(mem) ? mem : []);
      setName(ws?.name || '');
      setBoardPolicy(ws?.board_creation_policy || 'members');
    } catch (e) {
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
    () => (members && userId ? isWorkspaceAdmin(members, userId) : false),
    [members, userId]
  );

  const canManage = isOwnerFlag || isAdminFlag;

  const displayName = workspace?.name || fallbackWorkspace?.name || 'Workspace';
  const displayInitial = displayName?.charAt(0)?.toUpperCase() || 'W';

  const handleSaveProfile = async () => {
    if (!workspace) return;
    try {
      setSavingProfile(true);
      const payload = { name };
      const res = await updateWorkspace(workspace.id, payload);
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
      const payload = { board_creation_policy: boardPolicy };
      const res = await updateWorkspace(workspace.id, payload);
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

  if (loading && !workspace && !fallbackWorkspace) {
    return (
      <PageContainer>
        <ContentWrapper>
          <PageHeader>
            <TitleBlock>
              <WorkspaceAvatar>?</WorkspaceAvatar>
              <div>
                <PageTitle>Workspace Settings</PageTitle>
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
                <PageSubtitle>This workspace may have been removed or you do not have access.</PageSubtitle>
              </div>
            </TitleBlock>
            <TopRightActions>
              <SmallButton variant="outline-light" onClick={() => navigate('/boards')}>
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

        <SectionsGrid>
          <div>
            <SectionCard>
              <SectionHeader>
                <SectionTitle>Workspace profile</SectionTitle>
                <SectionDescription>
                  Update the name of this workspace. Only admins and the owner can edit these settings.
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
                  <MutedText>You need admin access to update this workspace.</MutedText>
                )}
                <SmallButton
                  variant="primary"
                  onClick={handleSaveProfile}
                  disabled={!canManage || savingProfile || !name.trim()}
                >
                  {savingProfile ? 'Saving...' : 'Save'}
                </SmallButton>
              </SectionActions>
            </SectionCard>

            <SectionCard style={{ marginTop: 16 }}>
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
                  <MutedText>Only workspace admins can change this policy.</MutedText>
                )}
                <SmallButton
                  variant="primary"
                  onClick={handleSavePolicy}
                  disabled={!canManage || savingPolicy}
                >
                  {savingPolicy ? 'Saving...' : 'Save'}
                </SmallButton>
              </SectionActions>
            </SectionCard>
          </div>

          <div>
            <SectionCard>
              <SectionHeader>
                <SectionTitle>Members</SectionTitle>
                <SectionDescription>
                  View members of this workspace. Use the members page for full management.
                </SectionDescription>
              </SectionHeader>

              <SectionActions style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                <SmallButton
                  variant="outline-light"
                  onClick={handleOpenMembersPage}
                  size="sm"
                >
                  Open members page
                </SmallButton>
                <SmallButton
                  variant="primary"
                  size="sm"
                  onClick={() => setShowInvite(true)}
                >
                  Invite member
                </SmallButton>
              </SectionActions>

              {members.length === 0 ? (
                <MutedText>No members found.</MutedText>
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
                    if (workspace && u.id && isWorkspaceOwner(workspace, u.id)) {
                      roleVariant = 'owner';
                    } else if (m.role === 'admin') {
                      roleVariant = 'admin';
                    }
                    const nameLabel = u.full_name || u.username || u.email || 'User';
                    return (
                      <MemberRow key={m.id || u.id}>
                        <MemberAvatar>{String(initial).toUpperCase()}</MemberAvatar>
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

            <DangerCard style={{ marginTop: 16 }}>
              <SectionHeader>
                <SectionTitle>Danger zone</SectionTitle>
                <SectionDescription>
                  Permanently delete this workspace and all its boards.
                </SectionDescription>
              </SectionHeader>
              <DangerText>
                This action cannot be undone. Only the workspace owner can delete a workspace.
              </DangerText>
              <SectionActions>
                {!isOwnerFlag && (
                  <MutedText>Only the workspace owner can delete this workspace.</MutedText>
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
          </div>
        </SectionsGrid>

        {showInvite && workspace && (
          <InviteWorkspaceModal
            workspaceId={workspace.id}
            workspaceName={workspace.name}
            onClose={() => setShowInvite(false)}
            onCreatedLink={() => {}}
          />
        )}
      </ContentWrapper>
    </PageContainer>
  );
}
