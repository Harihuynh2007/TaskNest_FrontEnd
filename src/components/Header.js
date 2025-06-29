// src/components/Header.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../contexts';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  return (
    <header className="header">
      <h1>TaskNest</h1>
      {user && (
        <div>
          <span>{user.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </header>
  );
}
