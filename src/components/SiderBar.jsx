// SiderBar.jsx (ĐÃ SỬA LỖI HOÀN CHỈNH)

import React, { useContext, useState } from 'react'; // <-- SỬA LỖI 1: Thêm useState
import { Col, ListGroup, Dropdown, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { WorkspaceContext } from '../contexts/WorkspaceContext';
// <-- SỬA LỖI 2: Thêm icon mũi tên và bỏ icon không dùng
import { FaTrello, FaPlus, FaFileAlt, FaHome, FaUsers, FaCog, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// --- STYLED COMPONENTS ---
// (Giữ nguyên từ file gốc của bạn)
const StyledItem = styled(ListGroup.Item)`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  padding: 10px 12px;
  border: none;
  background-color: ${({ $isActive }) => ($isActive ? '#e0f3e0' : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? '#28A745' : '#333')};

  &:hover {
    background-color: #f4f5f7;
  }

  svg {
    margin-right: 8px;
    color: ${({ $isActive }) => ($isActive ? '#28A745' : '#666')};
  }
`;

// <-- SỬA LỖI 3: Thêm các styled components bị thiếu
const WorkspaceHeader = styled.div`
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #6b778c;
  margin-bottom: 8px;
  padding-left: 12px;
  font-weight: 600;
`;

const CollapsibleWorkspaceToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 4px;

  &:hover { background-color: #f4f5f7; }
  .workspace-info { display: flex; align-items: center; flex-grow: 1; }
  .workspace-avatar {
    width: 32px; height: 32px; border-radius: 4px; background-color: #0079BF;
    color: white; display: flex; align-items: center; justify-content: center;
    font-weight: bold; font-size: 1rem; margin-right: 12px; flex-shrink: 0;
  }
  .workspace-name {
    font-weight: 600; font-size: 0.95rem; color: #172B4D;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  svg { color: #6b778c; flex-shrink: 0; }
`;

const WorkspaceNavItem = styled(ListGroup.Item)`
  display: flex; align-items: center; cursor: pointer; border: none;
  padding: 6px 12px; border-radius: 3px; margin-bottom: 2px;
  background-color: ${({ $isActive }) => ($isActive ? '#E4F0F6' : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? '#0079BF' : '#42526E')};
  font-weight: ${({ $isActive }) => ($isActive ? '600' : '500')};

  &:hover { background-color: #f4f5f7; color: #172B4D; }
  svg { margin-right: 12px; font-size: 1rem; color: inherit; }
`;

const InviteButton = styled.button`
    margin-left: auto; background: transparent; border: none; cursor: pointer;
    padding: 6px; display: flex; align-items: center; justify-content: center;
    border-radius: 3px; color: #6b778c;
    &:hover { background-color: #dfe1e6; color: #172B4D; }
`;

const SquareButton = styled(Button)`
  /* Giữ nguyên định nghĩa SquareButton của bạn */
`;

// --- COMPONENT CHÍNH ---
export default function SiderBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // <-- SỬA LỖI 1: Khởi tạo state
  const [isWorkspaceMenuOpen, setWorkspaceMenuOpen] = useState(true);

  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId, loadingWorkspaces } = useContext(WorkspaceContext);
  const currentWs = workspaces.find(w => w.id === currentWorkspaceId) || {};

  // <-- SỬA LỖI 4: Sửa typo tên hàm
  const isWorkspacePathActive = (path) => {
    return location.pathname.startsWith(`/w/${currentWs.id}/${path}`);
  };

  const handleWorkspaceChange = (workspaceId) => {
    setCurrentWorkspaceId(workspaceId);
    navigate(`/w/${workspaceId}/boards`);
    setWorkspaceMenuOpen(true);
  };

  if (loadingWorkspaces) {
    return (
      <Col xs={3} className="bg-white border-right p-3">
        <div>Loading workspaces...</div>
      </Col>
    );
  }

  if (!currentWs.id) {
    return (
      <Col xs={3} className="bg-white border-right p-3">
        <ListGroup variant="flush" className="mb-4">
        </ListGroup>
        <div className="p-3 text-center text-muted">
          <p>You are not in any workspace.</p>
          <Button variant="primary" size="sm" onClick={() => navigate('/create-workspace')}>Create a Workspace</Button>
        </div>
      </Col>
    )
  }

  return (
    <Col xs={3} className="bg-white border-right p-3">
      {/* Top navigation */}
      <ListGroup variant="flush" className="mb-4">
        <StyledItem $isActive={location.pathname === '/boards'} onClick={() => navigate('/boards')}>
          <FaTrello /> Boards
        </StyledItem>
        <StyledItem $isActive={location.pathname === '/templates'} onClick={() => navigate('/templates')}>
          <FaFileAlt /> Templates
        </StyledItem>
        <StyledItem $isActive={location.pathname === '/home'} onClick={() => navigate('/home')}>
          <FaHome /> Home
        </StyledItem>
      </ListGroup>

      {/* Workspace Section */}
      <WorkspaceHeader>Workspaces</WorkspaceHeader>
      
      <CollapsibleWorkspaceToggle onClick={() => setWorkspaceMenuOpen(!isWorkspaceMenuOpen)}>
        <div className="workspace-info">
          <div className="workspace-avatar">
            {currentWs.name ? currentWs.name[0].toUpperCase() : 'W'}
          </div>
          <div className="workspace-name">{currentWs.name}</div>
        </div>
        {isWorkspaceMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
      </CollapsibleWorkspaceToggle>

      {isWorkspaceMenuOpen && (
        <ListGroup variant="flush" className="mb-4 mt-2">
          <WorkspaceNavItem $isActive={isWorkspacePathActive('boards')} onClick={() => navigate(`/w/${currentWs.id}/boards`)}>
            <FaTrello /> Boards
          </WorkspaceNavItem>
          <WorkspaceNavItem $isActive={isWorkspacePathActive('members')} onClick={() => navigate(`/w/${currentWs.id}/members`)}>
            <FaUsers /> Members
            <InviteButton aria-label="Invite Workspace members">
              <FaPlus size={12} />
            </InviteButton>
          </WorkspaceNavItem>
          <WorkspaceNavItem $isActive={isWorkspacePathActive('settings')} onClick={() => navigate(`/w/${currentWs.id}/settings`)}>
            <FaCog /> Settings
          </WorkspaceNavItem>
        </ListGroup>
      )}

      {workspaces.length > 1 && (
        <Dropdown className="mt-2 mb-4">
          <Dropdown.Toggle variant="light" size="sm" className="w-100 text-muted">
            Switch to another workspace
          </Dropdown.Toggle>
          <Dropdown.Menu className="w-100">
            {workspaces
              .filter(ws => ws.id !== currentWorkspaceId)
              .map(ws => (
                <Dropdown.Item key={ws.id} onClick={() => handleWorkspaceChange(ws.id)}>
                  {ws.name}
                </Dropdown.Item>
              ))
            }
          </Dropdown.Menu>
        </Dropdown>
      )}
      
      {/* Premium promo card */}
      <div className="p-3 border rounded">
        <h6>Try TaskNest Premium</h6>
        <p className="mb-1 small">
          Get Planner (full access), advanced features, and more.
        </p>
        <SquareButton variant="outline-success" size="sm">
          Start free trial
        </SquareButton>
      </div>
    </Col>
  );
}