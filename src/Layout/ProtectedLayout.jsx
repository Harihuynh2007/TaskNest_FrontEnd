// src/layouts/AppLayout.jsx (Merge và đổi tên mới)
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext'; // Đổi nếu path khác
import Header from '../components/Header';
import SiderBar from '../components/SiderBar'; 
import { Row, Col } from 'react-bootstrap';

export default function AppLayout({ children, isProtected = true }) {
  const { user } = useContext(AuthContext); // Chỉ dùng nếu isProtected

  return (
    <div className="app-layout">
      <Header user={isProtected ? user : null} /> 
      <div className="layout-body" style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 56px)' }}>
        <Row className="g-0 h-100">
          <Col md={3} className="SiderBar-col"><SiderBar /></Col>
          <Col md={9} className="bg-light p-4 overflow-auto">
            {children}
          </Col>
        </Row>
      </div>
    </div>
  );
}