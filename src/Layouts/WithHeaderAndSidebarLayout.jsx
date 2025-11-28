// src/layouts/WithHeaderAndSidebarLayout.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Header from '../components/Header';
import SiderBar from '../components/SiderBar';
import { Row, Col } from 'react-bootstrap';

export default function WithHeaderAndSidebarLayout({ children }) {
  // Tách style ra biến để code JSX gọn gàng hơn
  const layoutStyle = {
    background: "var(--surface-1, #171c26)",
    minHeight: "calc(100vh - var(--header-height, 56px))",
    overflow: "hidden" // Ngăn scroll body, chỉ scroll nội dung
  };

  const contentAreaStyle = {
    height: "calc(100vh - var(--header-height, 56px))",
    overflowY: "auto", // Chỉ cuộn phần nội dung chính
    color: 'var(--text-primary, #e1e3e6)'
  };

  return (
    <>
      <Header />

      <div style={layoutStyle}>
        <Row className="g-0 h-100">
          
          {/* Sidebar - Dùng thẻ aside */}
          <Col xs="auto" as="aside" className="p-0 d-none d-md-block">
             {/* Lưu ý: Cần đảm bảo SiderBar có chiều cao 100% hoặc xử lý scroll bên trong nó */}
            <SiderBar />
          </Col>

          {/* Main Content - Dùng thẻ main */}
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