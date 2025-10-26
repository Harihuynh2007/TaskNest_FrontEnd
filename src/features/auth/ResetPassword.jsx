// src/features/auth/ResetPassword.jsx
import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/apiClient';
import { auth } from '../../api/apiRoutes';
import './AuthStyles.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const token = new URLSearchParams(search).get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [message, setMessage] = useState('');

  const validatePassword = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!token) {
      setStatus('error');
      setMessage('Reset token is invalid or expired.');
      return;
    }
    if (!password || !confirm) {
      setStatus('error');
      setMessage('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    if (!validatePassword(password)) {
      setStatus('error');
      setMessage('Password must contain uppercase, number, and special character.');
      return;
    }

    setStatus('sending');
    try {
      await api.post(auth.resetPassword(), { token, new_password: password });
      setStatus('success');
      setMessage('Your password has been reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        'Something went wrong.';
      setStatus('error');
      setMessage(msg);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="auth-illustration">
          <img src="/reset-password-illustration.png" alt="Reset Password" />
          <h2>Set your new password</h2>
          <p>Enter a strong password and confirm it to complete the reset process.</p>
        </div>

        <div className="auth-form-side">
          <h3 className="auth-title">Reset Password</h3>

          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group controlId="newPassword" className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === 'sending' || status === 'success'}
                className="auth-input"
                autoFocus
              />
            </Form.Group>

            <Form.Group controlId="confirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Re-enter new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={status === 'sending' || status === 'success'}
                className="auth-input"
              />
            </Form.Group>

            <div className="d-grid mt-3 mb-3">
              <Button
                type="submit"
                className="auth-btn"
                disabled={status === 'sending' || status === 'success'}
                aria-label="Confirm password reset"
              >
                {status === 'sending' ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  'Confirm Reset'
                )}
              </Button>
            </div>
          </Form>

          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                key="success"
                className="auth-alert success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                ✅ {message}
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                key="error"
                className="auth-alert error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                ⚠️ {message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-3">
            <Link to="/login" className="auth-link">← Back to Login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
