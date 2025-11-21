// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App' ;
import api from './api/apiClient';


import './styles/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, WorkspaceProvider, ModalProvider } from './contexts';
import { TokenManager } from './api/tokenManager';

const token = TokenManager.getAccessToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="230570345332-if0223t4bdf57r4g01p0prc359pcd093.apps.googleusercontent.com">
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <ModalProvider>
              <App />
              <ToastContainer position="top-center" />
            </ModalProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
