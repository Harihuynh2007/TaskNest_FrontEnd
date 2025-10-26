// src/features/auth/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/apiClient';
import { auth } from '../../api/apiRoutes';
import './AuthStyles.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [disabled, setDisabled] = useState(false);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('idle');
    setMessage('');

    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email.');
      return;
    }
    if (!isValidEmail(email)) {
      setStatus('error');
      setMessage('Invalid email format.');
      return;
    }

    setStatus('sending');
    try {
      await api.post(auth.forgotPassword(), { email });
      setStatus('sent');
      setMessage('If this email exists, a reset link has been sent.');
      setDisabled(true);
      setTimeout(() => setDisabled(false), 5000);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        'Network error. Please try again.';
      setStatus('error');
      setMessage(msg);
    }
  };

  useEffect(() => {
    if (status === 'sent' || status === 'error') {
      const timer = setTimeout(() => setMessage(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="auth-illustration">
          <img src="/forgot-password-illustration.png" alt="Reset Password" />
          <h2>Reset your password</h2>
          <p>We’ll send a secure link to your email so you can set a new one.</p>
        </div>

        <div className="auth-form-side">
          <h3 className="auth-title">Forgot Password</h3>

          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="forgotEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'sending' || disabled}
                className="auth-input"
                autoFocus
              />
            </Form.Group>

            <div className="d-grid mb-3">
              <Button
                type="submit"
                className="auth-btn"
                disabled={status === 'sending' || disabled}
                aria-label="Send reset email"
              >
                {status === 'sending' ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </div>
          </Form>

          <AnimatePresence>
            {status === 'sent' && (
              <motion.div
                key="success"
                className="auth-alert success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                ✅ {message}
                <p className="small mt-2">
                  Please check your inbox (and spam folder).  
                  This link will expire in 1 hour.
                </p>
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
