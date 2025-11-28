// src/components/FullPageLoader.jsx
import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function FullPageLoader() {
  return (
    <div
      className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100"
      style={{
        height: '100vh',
        zIndex: 9999, // Đảm bảo luôn nằm trên các thành phần khác
        background: 'var(--surface-1, #171c26)',
        color: 'var(--text-primary, #e1e3e6)',
      }}
    >
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}