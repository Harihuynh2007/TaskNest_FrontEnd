// src/components/auth/ResetPasswordPage.jsx

import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function ResetPassword({ baseUrl = '' }) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const token = new URLSearchParams(search).get('token'); // lấy token từ query

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [loading, setLoading] = useState(false);

  const validatePassword = (value) => {
    // ít nhất 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('idle');

    if (!token) {
      setError('Token không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (!password || !confirm) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Mật khẩu cần ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/reset-password/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, new_password: password }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Đặt lại mật khẩu thất bại.');

      setStatus('success');
      setPassword('');
      setConfirm('');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex justify-content-center align-items-center bg-light px-3">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="p-4 shadow">
            <h4 className="text-center mb-3">Reset Password</h4>

            {status === 'success' && (
              <Alert variant="success" className="text-center">
                Mật khẩu đã được đặt lại thành công!<br />
                Đang chuyển hướng đến trang đăng nhập...
              </Alert>
            )}
            {status === 'error' && (
              <Alert variant="danger" className="text-center">
                {error || 'Có lỗi xảy ra. Vui lòng thử lại.'}
              </Alert>
            )}

            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group controlId="newPassword" className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={!!error && !password}
                  disabled={loading || status === 'success'}
                  required
                />
              </Form.Group>

              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label>Xác nhận mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  isInvalid={!!error && !confirm}
                  disabled={loading || status === 'success'}
                  required
                />
                {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3"
                disabled={loading || status === 'success'}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận đặt lại mật khẩu'
                )}
              </Button>
            </Form>

            <div className="text-center">
              <Link to="/login" className="d-block">
                Quay lại đăng nhập
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
