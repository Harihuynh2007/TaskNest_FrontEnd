// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <ul>
        <li><Link to="/boards">Boards</Link></li>
      </ul>
    </nav>
  );
}
