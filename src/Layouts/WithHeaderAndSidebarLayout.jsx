import React from 'react';
import Header from '../components/Header';
import SiderBar from '../components/SiderBar';
import { Row, Col } from 'react-bootstrap';

export default function WithHeaderAndSidebarLayout({ children }) {
  return (
    <>
      <Header />
<div style={{
  background: 'var(--surface-1, #171c26)',
  minHeight: 'calc(100vh - var(--header-height, 56px))'
}}>
  <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
    <Row className="g-0" style={{ height: 'calc(100vh - var(--header-height, 56px))' }}>
      <SiderBar />
      <Col
        xs={9}
        className="p-4 overflow-auto tn-page"
        style={{ background: 'var(--surface-1, #171c26)', color: 'var(--text-primary, #e1e3e6)' }}
      >
        {children}
      </Col>
    </Row>
  </div>
</div>

    </>
  );
}
