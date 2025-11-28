// src/layouts/WithHeaderOnlyLayout.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Header from '../components/Header';

export default function WithHeaderOnlyLayout({ children }) {
  return (
    <>
      <Header />
      {/* Sử dụng thẻ main cho nội dung chính */}
      <main 
        style={{
          background: 'var(--surface-1, #171c26)',
          minHeight: 'calc(100vh - var(--header-height, 56px))',
          display: 'flex',       // Đảm bảo layout linh hoạt
          flexDirection: 'column'
        }}
      >
        <div
          className="container-fluid pt-3 tn-page flex-grow-1"
          style={{ color: 'var(--text-primary, #e1e3e6)' }}
        >
          {children}
        </div>
      </main>
    </>
  );
}

WithHeaderOnlyLayout.propTypes = {
  children: PropTypes.node.isRequired,
};