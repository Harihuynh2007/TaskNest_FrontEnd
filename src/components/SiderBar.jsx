// src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WorkspaceContext } from '../contexts/WorkspaceContext';

export default function Sidebar() {
  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId } = useContext(WorkspaceContext);

  return (
    <nav className="sidebar">
      <ul className="nav-items">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/templates">Templates</Link></li>
        <li><Link to="/boards">Boards</Link></li>
      </ul>
      <div className="workspace-list">
        <h4>Workspaces</h4>
        <ul>
          {workspaces.map(ws => (
            <li
              key={ws.id}
              className={ws.id === currentWorkspaceId ? 'active' : ''}
              onClick={() => setCurrentWorkspaceId(ws.id)}
            >
              {ws.name}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
