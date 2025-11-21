import React from 'react';
import Header from '../components/Header';
import SiderBar from '../components/SiderBar';
import { Row, Col } from 'react-bootstrap';

export default function WithHeaderAndSidebarLayout({ children }) {
  return (
    <>
      <Header />

      <div
        style={{
          background: "var(--surface-1, #171c26)",
          minHeight: "calc(100vh - var(--header-height))",
        }}
      >
        <Row
          className="g-0"
          style={{ height: "calc(100vh - var(--header-height))" }}
        >

          {/* Sidebar */}
          <Col xs="auto" className="p-0">
            <SiderBar />
          </Col>

          {/* Main Content */}
          <Col className="p-4 overflow-auto tn-page">
            {children}
          </Col>

        </Row>
      </div>
    </>
  );
}
