// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App';
import api from './api/apiClient';

// CSS Imports - Single entry point
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css'; // Contains all custom styles (tokens, base, components, app-specific)
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, WorkspaceProvider, ModalProvider } from './contexts';
import { TokenManager } from './api/tokenManager';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to error tracking service (Sentry, LogRocket, etc.)
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface-1, #171c26)',
            color: 'var(--text-primary, #e1e3e6)',
            padding: '20px'
          }}
        >
          <div style={{ maxWidth: '600px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️ Oops!</h1>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Something went wrong</h2>
            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>
            
            {this.state.error && (
              <details style={{ 
                marginBottom: '24px', 
                textAlign: 'left',
                background: 'var(--surface-2)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--panel-border)'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
                  Error Details
                </summary>
                <pre style={{ 
                  fontSize: '12px', 
                  overflow: 'auto',
                  color: '#ef4444'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleReset}
              style={{
                background: 'var(--brand-gradient)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(58, 123, 213, 0.3)'
              }}
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize API token if exists
const token = TokenManager.getAccessToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Google OAuth Client ID (should be in .env)
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  throw new Error('REACT_APP_GOOGLE_CLIENT_ID environment variable is required');
}
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AuthProvider>
            <WorkspaceProvider>
              <ModalProvider>
                <App />
                <ToastContainer 
                  position="top-center"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                />
              </ModalProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Performance monitoring (optional)
if (process.env.NODE_ENV === 'development') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      console.log('[Dev] Service Worker not registered in development');
    });
  }
}