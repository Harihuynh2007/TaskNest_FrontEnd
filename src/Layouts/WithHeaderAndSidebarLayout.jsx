// ===== WithHeaderAndSidebarLayout.jsx =====
import React from 'react';
import PropTypes from 'prop-types';
import Header from '../components/Header';
import SiderBar from '../components/SiderBar';
import { Row, Col } from 'react-bootstrap';

export function WithHeaderAndSidebarLayout({ children }) {
  const layoutStyle = {
    background: "var(--surface-1)",
    minHeight: "calc(100vh - var(--header-height))",
    overflow: "hidden"
  };

  const contentAreaStyle = {
    height: "calc(100vh - var(--header-height))",
    overflowY: "auto",
    color: 'var(--text-primary)'
  };

  return (
    <>
      <Header />
      <div style={layoutStyle}>
        <Row className="g-0 h-100">
          <Col xs="auto" as="aside" className="p-0 d-none d-md-block">
            <SiderBar />
          </Col>
          <Col as="main" className="p-4 tn-page" style={contentAreaStyle}>
            {children}
          </Col>
        </Row>
      </div>
    </>
  );
}

WithHeaderAndSidebarLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default WithHeaderAndSidebarLayout;

// ===== WithHeaderOnlyLayout.jsx =====
export function WithHeaderOnlyLayout({ children }) {
  return (
    <>
      <Header />
      <main 
        style={{
          background: 'var(--surface-1)',
          minHeight: 'calc(100vh - var(--header-height))',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          className="container-fluid pt-3 tn-page flex-grow-1"
          style={{ color: 'var(--text-primary)' }}
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

// ===== FullPageLoader.jsx =====
export function FullPageLoader() {
  return (
    <div
      className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100"
      style={{
        height: '100vh',
        zIndex: 9999,
        background: 'var(--surface-1)',
        color: 'var(--text-primary)',
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your workspace...</p>
      </div>
    </div>
  );
}