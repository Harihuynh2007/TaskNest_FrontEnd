// src/components/FullPageLoader.jsx
import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function FullPageLoader() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: '100vh',
        background: 'var(--surface-1, #171c26)',
        color: 'var(--text-primary, #e1e3e6)'
      }}
    >
      <Spinner animation="border" role="status" />
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}
