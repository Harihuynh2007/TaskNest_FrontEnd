// src/layouts/ProtectedLayout.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../contexts';
import Header from '../components/Header';
import SideBar from '../components/SiderBar';

export default function ProtectedLayout({ children }) {
  const { user } = useContext(AuthContext);
  return (
    <div className="app-layout">
      <Header user={user} />
      <div className="layout-body">
        <SideBar />
        <main>{children}</main>
      </div>
    </div>
  );
}
