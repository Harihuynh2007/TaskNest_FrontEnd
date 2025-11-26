// src/App.js
import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthContext } from './contexts/AuthContext';

import { GlobalStyle } from './styles/GlobalStyle';

import PrivateRoute from './Layouts/PrivateRoute';
import WithHeaderOnlyLayout from './Layouts/WithHeaderOnlyLayout';

import AuthForm from './features/auth/AuthForm';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import MFAVerify from './features/auth/components/MFAVerify';

import HomePage from './features/home/HomePage';
import BoardsPage from './features/boards/BoardsPage';
import BoardDetailPage from './features/boards/BoardDetailPage';
import BoardsMainContent from './features/boards/BoardsMainContent';
import TemplatesPage from './features/templates/TemplatesPage';
import WorkspaceSettingsPage from './components/Workspace/WorkspaceSettingsPage';
import WorkspaceBoardsPage from './features/boards/WorkspaceBoardsPage';

import Settings from './features/boards/settings/Setting';
import ProfileAndVisibility from './features/boards/settings/profileandvisibility/ProfileAndVisibility';
import Activity from './features/boards/settings/ActivitySetting';

const LogoutRedirect = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return null;
};

function App() {
  const { user, mfaRequired, completeMFALogin } = useContext(AuthContext);
  const location = useLocation();

  // CRITICAL: Handle MFA verification flow
  if (mfaRequired) {
    return (
      <>
        <GlobalStyle />
        <MFAVerify
          onVerify={async (code) => {
            const result = await completeMFALogin(code);
            if (!result.success) {
              throw new Error('Invalid code');
            }
          }}
          onUseBackup={() => {
            // Handle backup code flow
          }}
        />
      </>
    );
  }

  return (
    <>
      <GlobalStyle/>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<AuthForm mode="login" />} />
        <Route path="/register" element={<AuthForm mode="register" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* App routes with header */}
        <Route
          path="/workspaces/:workspaceId/boards/:boardId"
          element={
            <PrivateRoute>
              <WithHeaderOnlyLayout>
                <BoardDetailPage />
              </WithHeaderOnlyLayout>
            </PrivateRoute>
          }
        />

        <Route path="/w/:workspaceId/boards" element={<WorkspaceBoardsPage />} />

        <Route
          path="/workspaces/:workspaceId/boards/:boardId/inbox"
          element={
            <PrivateRoute>
              <WithHeaderOnlyLayout>
                <BoardDetailPage />
              </WithHeaderOnlyLayout>
            </PrivateRoute>
          }
        />
        
        {/* Settings - bảo vệ + header */}
        <Route
          path="/u/me/profile"
          element={
            <PrivateRoute>
              <WithHeaderOnlyLayout>
                <ProfileAndVisibility />
              </WithHeaderOnlyLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <WithHeaderOnlyLayout>
                <Settings />
              </WithHeaderOnlyLayout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/activitySettings"
          element={
            <PrivateRoute>
              <WithHeaderOnlyLayout>
                <Activity />
              </WithHeaderOnlyLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/boards/*"
          element={
            <PrivateRoute>
              <BoardsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <PrivateRoute>
              <TemplatesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/w/:workspaceId/settings"
          element={
            <PrivateRoute>
              <WithHeaderOnlyLayout>
                <WorkspaceSettingsPage />
              </WithHeaderOnlyLayout>
            </PrivateRoute>
          }
        />


        <Route 
          path="/" 
          element={user ? <Navigate to="/boards" replace /> : <Navigate to="/login" replace />} 
        />
        <Route path="*" element={<Navigate to="/boards" replace />} />
         
      </Routes>
    </>
  );
}

export default App;
