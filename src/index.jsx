// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // your global styles
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, WorkspaceProvider, ModalProvider } from './contexts';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <WorkspaceProvider>
        <ModalProvider>
          <App />
          <ToastContainer position="top-center" />
        </ModalProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </React.StrictMode>
);