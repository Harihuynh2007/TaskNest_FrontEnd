import React, { useContext, useState, useMemo, useCallback } from 'react';
import { Col, ListGroup, Dropdown, Button, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { WorkspaceContext } from '../contexts/WorkspaceContext';
import { createWorkspace } from '../api/workspaceApi';
import { AuthContext } from '../contexts/AuthContext';
import {
  FaCheck,
  FaTrello,
  FaPlus,
  FaFileAlt,
  FaHome,
  FaUsers,
  FaCog,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import InviteWorkspaceModal from './Workspace/InviteWorkspaceModal';
import CreateWorkspaceModal from './Workspace/CreateWorkspaceModal';

// ================== Styled Components ==================

const SidebarContainer = styled(Col)`
  /* Định nghĩa biến màu cho toàn bộ component */
  --bg-primary: #171c26;
  --bg-secondary: #222834;
  --bg-hover: #2c3341;
  --bg-active: #3c4455;
  --text-primary: #e1e3e6;
  --text-secondary: #8a93a2;
  --text-accent: #58aff6;
  --border-primary: #3a414f;
  --border-subtle: #2c3341;
  --brand-primary: #58aff6;
  --brand-gradient: linear-gradient(135deg, #58aff6 0%, #3a7bd5 100%);
  --success-primary: #33c481;

  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-primary);
  padding: 12px;
  height: calc(100vh - var(--header-height, 48px));
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  min-width: 240px;
  max-width: 280px;
  flex: 0 0 260px;
  position: sticky;
  top: var(--header-height, 48px);
  transition: background-color 0.3s ease;

  /* Custom scrollbar cho theme tối */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #4a5261;
    border-radius: 4px;
    &:hover {
      background: #5f687a;
    }
  }

  @media (max-width: 768px) {
    display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
    position: fixed;
    left: 0;
    top: var(--header-height, 48px);
    z-index: 100;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.3);
  }
`;

const StyledItem = styled(ListGroup.Item)`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: ${({ $isActive }) => ($isActive ? '600' : '500')};
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  margin-bottom: 4px;
  background-color: ${({ $isActive }) =>
    $isActive ? 'rgba(88, 175, 246, 0.15)' : 'transparent'};
  color: ${({ $isActive }) =>
    $isActive ? 'var(--brand-primary)' : 'var(--text-secondary)'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  &:active {
    background-color: var(--bg-active);
    transform: scale(0.98);
  }

  svg {
    margin-right: 14px;
    font-size: 16px;
    color: ${({ $isActive }) =>
      $isActive ? 'var(--brand-primary)' : 'var(--text-secondary)'};
    transition: color 0.2s ease;
  }

  &:hover svg {
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--brand-primary);
    outline-offset: 2px;
  }
`;

const WorkspaceHeader = styled.div`
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  margin: 20px 0 10px 0;
  padding: 0 12px;
  letter-spacing: 0.08em;
`;

const CollapsibleWorkspaceToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  user-select: none;

  &:hover {
    background-color: var(--bg-hover);
  }

  &:active {
    background-color: var(--bg-active);
  }

  .workspace-info {
    display: flex;
    align-items: center;
    flex-grow: 1;
    min-width: 0;
  }

  .workspace-avatar {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: var(--brand-gradient);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    margin-right: 12px;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .workspace-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  svg {
    color: var(--text-secondary);
    transition: transform 0.25s ease;
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(0deg)' : 'rotate(-90deg)')};
  }
`;

const WorkspaceNavItem = styled(StyledItem)`
  padding: 8px 12px;
  font-size: 14px;
`;

const InviteButton = styled.button`
  margin-left: auto;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bg-active);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--brand-primary);
  }

  svg {
    margin: 0;
  }
`;

const WorkspaceMenuContainer = styled.div`
  overflow: hidden;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  max-height: ${({ $isOpen }) => ($isOpen ? '500px' : '0')};
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
`;

const StyledDropdown = styled(Dropdown)`
  margin-top: 8px;
  margin-bottom: 16px;

  .dropdown-toggle {
    width: 100%;
    text-align: left;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--brand-primary);
      color: var(--text-primary);
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(88, 175, 246, 0.3);
    }
  }

  .dropdown-menu {
    width: 100%;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    padding: 8px;
    margin-top: 4px;
  }

  .dropdown-item {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    color: var(--text-secondary);
    transition: all 0.15s ease;

    &:hover,
    &:focus {
      background-color: var(--bg-hover);
      color: var(--text-primary);
    }
  }
`;

const PromoCard = styled.div`
  margin-top: auto;
  padding: 16px;
  border-radius: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);

  h6 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  p {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 16px;
    line-height: 1.5;
  }
`;

const PromoButton = styled(Button)`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.2s ease;
  border: none;
  color: #fff;
  background: var(--brand-gradient);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  flex: 1;

  p {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 16px;
  }

  button {
    font-weight: 600;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--text-secondary);
  font-size: 14px;
  flex: 1;
`;

const WorkspaceListSection = styled.div`
  margin-top: 16px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 16px;
`;

const WorkspaceListToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  user-select: none;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;

  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  svg {
    font-size: 12px;
    transition: transform 0.25s ease;
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(0deg)' : 'rotate(-90deg)')};
  }
`;

const WorkspaceList = styled.div`
  overflow: hidden;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  max-height: ${({ $isOpen }) => ($isOpen ? '400px' : '0')};
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  margin-top: 8px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #4a5261;
    border-radius: 3px;
    &:hover {
      background: #5f687a;
    }
  }
`;

const WorkspaceItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background-color: ${({ $isActive }) =>
    $isActive ? 'var(--bg-hover)' : 'transparent'};

  &:hover {
    background-color: var(--bg-hover);
  }

  &:active {
    background-color: var(--bg-active);
    transform: scale(0.98);
  }

  .ws-avatar {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: ${({ $isActive }) =>
      $isActive
        ? 'var(--brand-gradient)'
        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
    margin-right: 12px;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .ws-info {
    flex: 1;
    min-width: 0;
  }

  .ws-name {
    font-size: 13px;
    font-weight: 600;
    color: ${({ $isActive }) =>
      $isActive ? 'var(--brand-primary)' : 'var(--text-primary)'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }

  .ws-meta {
    font-size: 11px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ws-check {
    position: absolute;
    right: 12px;
    color: var(--brand-primary);
    font-size: 14px;
  }
`;

const CreateWorkspaceButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  margin-top: 8px;
  background-color: var(--bg-secondary);
  border: 1px dashed var(--border-primary);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bg-hover);
    border-color: var(--brand-primary);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--brand-primary);
    outline-offset: 2px;
  }

  svg {
    font-size: 12px;
  }
`;

// ================== Component ==================

export default function SiderBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    loadingWorkspaces,
    refreshWorkspaces
  } = useContext(WorkspaceContext);
  const { user } = useContext(AuthContext); // hiện tại chưa dùng, nhưng giữ để sau dùng tới

  const [showInvite, setShowInvite] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [isWorkspaceMenuOpen, setWorkspaceMenuOpen] = useState(true);
  const [isWorkspaceListOpen, setWorkspaceListOpen] = useState(false);

  // Workspace hiện tại
  const currentWs = useMemo(
    () =>
      workspaces.find((w) => w.id === currentWorkspaceId) || {
        id: '',
        name: '',
        boards: [],
        effective_role: ''
      },
    [workspaces, currentWorkspaceId]
  );

  // Kiểm tra path active trong workspace
  const isWorkspacePathActive = useCallback(
    (path) => {
      if (!currentWs.id) return false;
      const regex = new RegExp(`^/w/${currentWs.id}/${path}(?:/|$)`);
      return regex.test(location.pathname);
    },
    [location.pathname, currentWs.id]
  );

  // ================== Handlers ==================

  const handleWorkspaceChange = useCallback(
    (workspaceId) => {
      setCurrentWorkspaceId(workspaceId);
      navigate(`/w/${workspaceId}/boards`);
      setWorkspaceMenuOpen(true);
    },
    [setCurrentWorkspaceId, navigate]
  );

  const toggleWorkspaceMenu = useCallback(() => {
    setWorkspaceMenuOpen((prev) => !prev);
  }, []);

  const toggleWorkspaceList = useCallback(() => {
    setWorkspaceListOpen((prev) => !prev);
  }, []);

  const handleInviteClick = useCallback((e) => {
    e.stopPropagation();
    setShowInvite(true);
  }, []);

  const handleCloseInvite = useCallback(() => {
    setShowInvite(false);
  }, []);

  const handleCreateWorkspace = useCallback(
    async (data) => {
      try {
        const response = await createWorkspace(data);
        const newWorkspace = response.data || response;

        if (refreshWorkspaces) {
          await refreshWorkspaces();
        }

        setCurrentWorkspaceId(newWorkspace.id);
        navigate(`/w/${newWorkspace.id}/boards`);
        setShowCreateWorkspace(false);
      } catch (error) {
        console.error('Failed to create workspace:', error);
        throw error;
      }
    },
    [navigate, setCurrentWorkspaceId, refreshWorkspaces]
  );

  const getRoleBadgeColor = useCallback((role) => {
    switch (role) {
      case 'owner':
        return 'success';
      case 'admin':
        return 'primary';
      case 'member':
        return 'info';
      case 'guest':
        return 'secondary';
      default:
        return 'secondary';
    }
  }, []);

  const getRoleLabel = useCallback((role) => {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member';
  }, []);

  const handleKeyDown = useCallback((e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);

  // ================== Nội dung chính (3 state) ==================

  let content = null;

  // 1. Loading
  if (loadingWorkspaces) {
    content = (
      <LoadingState>
        <div
          className="spinner-border spinner-border-sm me-2"
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        Loading workspaces...
      </LoadingState>
    );
  }
  // 2. Chưa có workspace hiện tại
  else if (!currentWs.id) {
    content = (
      <>
        <ListGroup variant="flush" className="mb-4">
          <StyledItem
            $isActive={location.pathname === '/boards'}
            onClick={() => navigate('/boards')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              handleKeyDown(e, () => navigate('/boards'))
            }
          >
            <FaTrello /> Boards
          </StyledItem>
          <StyledItem
            $isActive={location.pathname === '/templates'}
            onClick={() => navigate('/templates')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              handleKeyDown(e, () => navigate('/templates'))
            }
          >
            <FaFileAlt /> Templates
          </StyledItem>
          <StyledItem
            $isActive={location.pathname === '/home'}
            onClick={() => navigate('/home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              handleKeyDown(e, () => navigate('/home'))
            }
          >
            <FaHome /> Home
          </StyledItem>
        </ListGroup>

        <EmptyState>
          <p>You are not in any workspace.</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateWorkspace(true)}
          >
            Create a Workspace
          </Button>
        </EmptyState>
      </>
    );
  }
  // 3. Có workspace hiện tại
  else {
    content = (
      <>
        {/* Top navigation */}
        <ListGroup variant="flush" className="mb-2">
          <StyledItem
            $isActive={location.pathname === '/boards'}
            onClick={() => navigate('/boards')}
            role="button"
            tabIndex={0}
            aria-label="Navigate to Boards"
            onKeyDown={(e) =>
              handleKeyDown(e, () => navigate('/boards'))
            }
          >
            <FaTrello /> Boards
          </StyledItem>
          <StyledItem
            $isActive={location.pathname === '/templates'}
            onClick={() => navigate('/templates')}
            role="button"
            tabIndex={0}
            aria-label="Navigate to Templates"
            onKeyDown={(e) =>
              handleKeyDown(e, () => navigate('/templates'))
            }
          >
            <FaFileAlt /> Templates
          </StyledItem>
          <StyledItem
            $isActive={location.pathname === '/home'}
            onClick={() => navigate('/home')}
            role="button"
            tabIndex={0}
            aria-label="Navigate to Home"
            onKeyDown={(e) =>
              handleKeyDown(e, () => navigate('/home'))
            }
          >
            <FaHome /> Home
          </StyledItem>
        </ListGroup>

        {/* Current Workspace Section */}
        <WorkspaceHeader>Workspace</WorkspaceHeader>

        <CollapsibleWorkspaceToggle
          onClick={toggleWorkspaceMenu}
          $isOpen={isWorkspaceMenuOpen}
          role="button"
          tabIndex={0}
          aria-expanded={isWorkspaceMenuOpen}
          aria-label={`${
            isWorkspaceMenuOpen ? 'Collapse' : 'Expand'
          } workspace menu`}
          onKeyDown={(e) => handleKeyDown(e, toggleWorkspaceMenu)}
        >
          <div className="workspace-info">
            <div className="workspace-avatar" aria-hidden="true">
              {currentWs.name
                ? currentWs.name[0].toUpperCase()
                : 'W'}
            </div>
            <div className="workspace-name" title={currentWs.name}>
              {currentWs.name}
            </div>
          </div>
          {isWorkspaceMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
        </CollapsibleWorkspaceToggle>

        <WorkspaceMenuContainer $isOpen={isWorkspaceMenuOpen}>
          <ListGroup variant="flush" className="mb-2 mt-1">
            <WorkspaceNavItem
              $isActive={isWorkspacePathActive('boards')}
              onClick={() => navigate(`/w/${currentWs.id}/boards`)}
              role="button"
              tabIndex={0}
              aria-label="Navigate to Workspace Boards"
              onKeyDown={(e) =>
                handleKeyDown(e, () =>
                  navigate(`/w/${currentWs.id}/boards`)
                )
              }
            >
              <FaTrello /> Boards
            </WorkspaceNavItem>

            <WorkspaceNavItem
              $isActive={isWorkspacePathActive('members')}
              onClick={() => navigate(`/w/${currentWs.id}/members`)}
              role="button"
              tabIndex={0}
              aria-label="Navigate to Workspace Members"
              onKeyDown={(e) =>
                handleKeyDown(e, () =>
                  navigate(`/w/${currentWs.id}/members`)
                )
              }
            >
              <FaUsers /> Members
              <InviteButton
                aria-label="Invite workspace members"
                onClick={handleInviteClick}
                onKeyDown={(e) => handleKeyDown(e, handleInviteClick)}
                title="Invite members"
                tabIndex={0}
              >
                <FaPlus size={12} />
              </InviteButton>
            </WorkspaceNavItem>

            <WorkspaceNavItem
              $isActive={isWorkspacePathActive('settings')}
              onClick={() => navigate(`/w/${currentWs.id}/settings`)}
              role="button"
              tabIndex={0}
              aria-label="Navigate to Workspace Settings"
              onKeyDown={(e) =>
                handleKeyDown(e, () =>
                  navigate(`/w/${currentWs.id}/settings`)
                )
              }
            >
              <FaCog /> Settings
            </WorkspaceNavItem>
          </ListGroup>
        </WorkspaceMenuContainer>

        {/* Workspace list */}
        <WorkspaceListSection>
          <WorkspaceListToggle
            onClick={toggleWorkspaceList}
            $isOpen={isWorkspaceListOpen}
            role="button"
            tabIndex={0}
            aria-expanded={isWorkspaceListOpen}
            aria-label="Toggle workspace list"
            onKeyDown={(e) =>
              handleKeyDown(e, toggleWorkspaceList)
            }
          >
            <span>Your Workspaces ({workspaces.length})</span>
            {isWorkspaceListOpen ? (
              <FaChevronUp />
            ) : (
              <FaChevronDown />
            )}
          </WorkspaceListToggle>

          <WorkspaceList $isOpen={isWorkspaceListOpen}>
            {workspaces.map((ws) => (
              <WorkspaceItem
                key={ws.id}
                $isActive={ws.id === currentWorkspaceId}
                onClick={() => handleWorkspaceChange(ws.id)}
                role="button"
                tabIndex={0}
                aria-label={`Switch to ${ws.name} workspace`}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => handleWorkspaceChange(ws.id))
                }
                title={ws.name}
              >
                <div className="ws-avatar">
                  {ws.name ? ws.name[0].toUpperCase() : 'W'}
                </div>
                <div className="ws-info">
                  <div className="ws-name">{ws.name}</div>
                  <div className="ws-meta">
                    <Badge
                      bg={getRoleBadgeColor(ws.effective_role)}
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px'
                      }}
                    >
                      {getRoleLabel(ws.effective_role)}
                    </Badge>
                    {ws.boards && ws.boards.length > 0 && (
                      <span>{ws.boards.length} boards</span>
                    )}
                  </div>
                </div>
                {ws.id === currentWorkspaceId && (
                  <FaCheck
                    className="ws-check"
                    aria-label="Current workspace"
                  />
                )}
              </WorkspaceItem>
            ))}

            <CreateWorkspaceButton
              onClick={() => setShowCreateWorkspace(true)}
              role="button"
              tabIndex={0}
              aria-label="Create new workspace"
              onKeyDown={(e) =>
                handleKeyDown(e, () => setShowCreateWorkspace(true))
              }
            >
              <FaPlus />
              <span>Create new workspace</span>
            </CreateWorkspaceButton>
          </WorkspaceList>
        </WorkspaceListSection>

        {/* Premium promo card */}
        <PromoCard>
          <h6>Try TaskNest Premium</h6>
          <p>Get Planner (full access), advanced features, and more.</p>
          <PromoButton size="sm">Start free trial</PromoButton>
        </PromoCard>
      </>
    );
  }

  // ================== Final render ==================
  // console.log('showCreateWorkspace = ', showCreateWorkspace);
  return (
    <>
      {/* Nếu bạn có prop isOpen từ ngoài truyền vào thì đổi $isOpen={true} thành $isOpen={props.isOpen} */}
      <SidebarContainer $isOpen={true}>
        {content}
      </SidebarContainer>

      {/* Modals luôn render dựa theo state */}
      {showInvite && currentWs?.id && (
        <InviteWorkspaceModal
          workspaceId={currentWs.id}
          workspaceName={currentWs.name}
          onClose={handleCloseInvite}
          onCreatedLink={() => {}}
        />
      )}
      {/* {showCreateWorkspace && (
        <div style={{ color: 'white', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
        DEBUG: Modal flag is TRUE
        </div>
      )} */}

      {showCreateWorkspace && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateWorkspace(false)}
          onContinue={handleCreateWorkspace}
        />
      )}
    </>
  );
}
