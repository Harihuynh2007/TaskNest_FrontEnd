import React, { useContext, useState, useMemo, useCallback } from 'react';
import { Col, ListGroup, Dropdown, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { WorkspaceContext } from '../contexts/WorkspaceContext';
import { FaTrello, FaPlus, FaFileAlt, FaHome, FaUsers, FaCog, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import InviteWorkspaceModal from './Workspace/InviteWorkspaceModal';

// Styled Components với UX cải thiện
// Giao diện Sáng (Light Mode) - Tinh tế & Hiện đại
// Giao diện Tối (Dark Mode) - Sang trọng & Tập trung
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
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: #4a5261;
    border-radius: 4px;
    &:hover { background: #5f687a; }
  }

  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
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
  background-color: ${({ $isActive }) => ($isActive ? 'rgba(88, 175, 246, 0.15)' : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? 'var(--brand-primary)' : 'var(--text-secondary)')};
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
    color: ${({ $isActive }) => ($isActive ? 'var(--brand-primary)' : 'var(--text-secondary)')};
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

  .workspace-info { display: flex; align-items: center; flex-grow: 1; min-width: 0; }

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

const WorkspaceNavItem = styled(StyledItem)` // Kế thừa từ StyledItem để đồng bộ
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
  
  &:focus-visible { outline: 2px solid var(--brand-primary); }

  svg { margin: 0; }
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
    
    &:focus { box-shadow: 0 0 0 2px rgba(88, 175, 246, 0.3); }
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

    &:hover, &:focus {
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

  button { /* Kế thừa từ PromoButton */
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

export default function SiderBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showInvite, setShowInvite] = useState(false);
  const [isWorkspaceMenuOpen, setWorkspaceMenuOpen] = useState(true);

  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId, loadingWorkspaces } = useContext(WorkspaceContext);
  
  // Memoize current workspace
  const currentWs = useMemo(() => 
    workspaces.find(w => w.id === currentWorkspaceId) || {},
    [workspaces, currentWorkspaceId]
  );

  // Memoize other workspaces
  const otherWorkspaces = useMemo(() => 
    workspaces.filter(ws => ws.id !== currentWorkspaceId),
    [workspaces, currentWorkspaceId]
  );

  const isWorkspacePathActive = useCallback((path) => {
    return location.pathname.startsWith(`/w/${currentWs.id}/${path}`);
  }, [location.pathname, currentWs.id]);

  const handleWorkspaceChange = useCallback((workspaceId) => {
    setCurrentWorkspaceId(workspaceId);
    navigate(`/w/${workspaceId}/boards`);
    setWorkspaceMenuOpen(true);
  }, [setCurrentWorkspaceId, navigate]);

  const toggleWorkspaceMenu = useCallback(() => {
    setWorkspaceMenuOpen(prev => !prev);
  }, []);

  const handleInviteClick = useCallback((e) => {
    e.stopPropagation();
    setShowInvite(true);
  }, []);

  const handleCloseInvite = useCallback(() => {
    setShowInvite(false);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);

  if (loadingWorkspaces) {
    return (
      <SidebarContainer>
        <LoadingState>
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          Loading workspaces...
        </LoadingState>
      </SidebarContainer>
    );
  }

  if (!currentWs.id) {
    return (
      <SidebarContainer>
        <ListGroup variant="flush" className="mb-4">
          <StyledItem 
            $isActive={location.pathname === '/boards'} 
            onClick={() => navigate('/boards')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => navigate('/boards'))}
          >
            <FaTrello /> Boards
          </StyledItem>
          <StyledItem 
            $isActive={location.pathname === '/templates'} 
            onClick={() => navigate('/templates')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => navigate('/templates'))}
          >
            <FaFileAlt /> Templates
          </StyledItem>
          <StyledItem 
            $isActive={location.pathname === '/home'} 
            onClick={() => navigate('/home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => navigate('/home'))}
          >
            <FaHome /> Home
          </StyledItem>
        </ListGroup>
        
        <EmptyState>
          <p>You are not in any workspace.</p>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => navigate('/create-workspace')}
          >
            Create a Workspace
          </Button>
        </EmptyState>
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer>
      {/* Top navigation */}
      <ListGroup variant="flush" className="mb-2">
        <StyledItem 
          $isActive={location.pathname === '/boards'} 
          onClick={() => navigate('/boards')}
          role="button"
          tabIndex={0}
          aria-label="Navigate to Boards"
          onKeyDown={(e) => handleKeyDown(e, () => navigate('/boards'))}
        >
          <FaTrello /> Boards
        </StyledItem>
        <StyledItem 
          $isActive={location.pathname === '/templates'} 
          onClick={() => navigate('/templates')}
          role="button"
          tabIndex={0}
          aria-label="Navigate to Templates"
          onKeyDown={(e) => handleKeyDown(e, () => navigate('/templates'))}
        >
          <FaFileAlt /> Templates
        </StyledItem>
        <StyledItem 
          $isActive={location.pathname === '/home'} 
          onClick={() => navigate('/home')}
          role="button"
          tabIndex={0}
          aria-label="Navigate to Home"
          onKeyDown={(e) => handleKeyDown(e, () => navigate('/home'))}
        >
          <FaHome /> Home
        </StyledItem>
      </ListGroup>

      {/* Workspace Section */}
      <WorkspaceHeader>Workspaces</WorkspaceHeader>
      
      <CollapsibleWorkspaceToggle 
        onClick={toggleWorkspaceMenu}
        $isOpen={isWorkspaceMenuOpen}
        role="button"
        tabIndex={0}
        aria-expanded={isWorkspaceMenuOpen}
        aria-label={`${isWorkspaceMenuOpen ? 'Collapse' : 'Expand'} workspace menu`}
        onKeyDown={(e) => handleKeyDown(e, toggleWorkspaceMenu)}
      >
        <div className="workspace-info">
          <div 
            className="workspace-avatar"
            aria-hidden="true"
          >
            {currentWs.name ? currentWs.name[0].toUpperCase() : 'W'}
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
            onKeyDown={(e) => handleKeyDown(e, () => navigate(`/w/${currentWs.id}/boards`))}
          >
            <FaTrello /> Boards
          </WorkspaceNavItem>
          
          <WorkspaceNavItem 
            $isActive={isWorkspacePathActive('members')} 
            onClick={() => navigate(`/w/${currentWs.id}/members`)}
            role="button"
            tabIndex={0}
            aria-label="Navigate to Workspace Members"
            onKeyDown={(e) => handleKeyDown(e, () => navigate(`/w/${currentWs.id}/members`))}
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
            onKeyDown={(e) => handleKeyDown(e, () => navigate(`/w/${currentWs.id}/settings`))}
          >
            <FaCog /> Settings
          </WorkspaceNavItem>
        </ListGroup>
      </WorkspaceMenuContainer>

      {otherWorkspaces.length > 0 && (
        <StyledDropdown>
          <Dropdown.Toggle 
            variant="light" 
            size="sm"
            id="workspace-dropdown"
          >
            Switch workspace
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {otherWorkspaces.map(ws => (
              <Dropdown.Item 
                key={ws.id} 
                onClick={() => handleWorkspaceChange(ws.id)}
              >
                {ws.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </StyledDropdown>
      )}
      
      {showInvite && currentWs?.id && (
        <InviteWorkspaceModal
          workspaceId={currentWs.id}
          workspaceName={currentWs.name}
          onClose={handleCloseInvite}
          onCreatedLink={() => {}}
        />
      )}

      {/* Premium promo card */}
      <PromoCard>
        <h6>Try TaskNest Premium</h6>
        <p>
          Get Planner (full access), advanced features, and more.
        </p>
        <PromoButton variant="outline-success" size="sm">
          Start free trial
        </PromoButton>
      </PromoCard>
    </SidebarContainer>
  );
}