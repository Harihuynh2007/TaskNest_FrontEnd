// src/layouts/WithHeaderOnlyLayout.jsx
import React from 'react';
import Header from '../components/Header';

export default function WithHeaderOnlyLayout({ children }) {
  return (
    <>
      <Header />
      <div style={{
        background: 'var(--surface-1, #171c26)',
        minHeight: 'calc(100vh - var(--header-height, 56px))'
      }}>
        <div
          className="container-fluid pt-3 tn-page"
          style={{ color: 'var(--text-primary, #e1e3e6)' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
