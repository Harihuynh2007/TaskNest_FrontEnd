// src/features/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/apiClient';
import { auth } from '../../api/apiRoutes';
import './AuthStyles.css';

/**
 * Secure Password Reset Flow:
 * 1. User clicks email link with token → /reset-password/:token
 * 2. Component validates token immediately and exchanges for session_id
 * 3. Token is removed from URL (no longer in browser history)
 * 4. User submits new password with session_id
 * 5. Backend validates session and updates password
 */
export default function ResetPassword() {
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token');
  const navigate = useNavigate();

  // State management
  const [sessionId, setSessionId] = useState(null);
  const [validating, setValidating] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  // Step 1: Validate token immediately on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('No reset token provided');
        setValidating(false);
        return;
      }

      try {
        // Exchange token for temporary session
        const res = await api.post(auth.validateResetToken(), { token });
        
        setSessionId(res.data.session_id);
        setValidating(false);
        
        // SECURITY: Remove token from URL immediately
        navigate('/reset-password', { replace: true });
      } catch (err) {
        console.error('Token validation failed:', err);
        setError(
          err.response?.data?.error || 
          err.response?.data?.message ||
          'Invalid or expired reset link. Please request a new one.'
        );
        setValidating(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  // Validate password strength
  const validatePassword = (pwd) => {
    const errors = [];
    
    if (pwd.length < 8) errors.push('Must be at least 8 characters');
    if (!/[a-z]/.test(pwd)) errors.push('Must contain lowercase letter');
    if (!/[A-Z]/.test(pwd)) errors.push('Must contain uppercase letter');
    if (!/\d/.test(pwd)) errors.push('Must contain number');
    if (!/[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/.test(pwd)) 
      errors.push('Must contain special character');
    
    return errors;
  };

  // Handle password input
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Real-time validation
    const errors = validatePassword(value);
    setValidationErrors(errors);
  };

  // Step 2: Submit new password with session_id
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      setError('Password does not meet requirements');
      setValidationErrors(errors);
      return;
    }

    setStatus('sending');
    
    try {
      await api.post(auth.resetPassword(), {
        session_id: sessionId,
        new_password: password
      });

      setStatus('success');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login?reset=success', { replace: true });
      }, 2000);
    } catch (err) {
      console.error('Password reset failed:', err);
      setStatus('error');
      setError(
        err.response?.data?.error || 
        err.response?.data?.message ||
        'Failed to reset password. Please try again.'
      );
    }
  };

  // Loading state
  if (validating) {
    return (
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '3rem' }}
        >
          <Spinner animation="border" variant="primary" className="mb-3" />
          <h4>Validating reset link...</h4>
          <p className="text-muted">Please wait while we verify your request</p>
        </motion.div>
      </div>
    );
  }

  // Error state (invalid token)
  if (error && !sessionId) {
    return (
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="auth-illustration">
            <img src="/error-illustration.png" alt="Error" />
            <h2>Invalid Reset Link</h2>
          </div>

          <div className="auth-form-side" style={{ textAlign: 'center' }}>
            <Alert variant="danger">
              <Alert.Heading>⚠️ Link Expired or Invalid</Alert.Heading>
              <p>{error}</p>
            </Alert>

            <div className="d-grid gap-2 mt-4">
              <Button 
                variant="primary" 
                onClick={() => navigate('/forgot-password')}
                className="auth-btn"
              >
                Request New Reset Link
              </Button>
              <Link to="/login" className="auth-link mt-3">
                ← Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main form
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
          <h2>Set Your New Password</h2>
          <p>Choose a strong password to protect your account</p>
        </div>

        <div className="auth-form-side">
          <h3 className="auth-title">Reset Password</h3>

          <Form noValidate onSubmit={handleSubmit}>
            {/* New Password */}
            <Form.Group controlId="newPassword" className="mb-3">
              <Form.Label>New Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={handlePasswordChange}
                  isInvalid={validationErrors.length > 0}
                  disabled={status === 'sending' || status === 'success'}
                  className="auth-input"
                  autoFocus
                  required
                />
                <Button
                  variant="link"
                  type="button"
                  className="toggle-eye"
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)' 
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </Button>
              </div>
              
              {/* Password requirements */}
              {password && (
                <div className="password-requirements mt-2">
                  <small className="text-muted d-block mb-1">Password must:</small>
                  {[
                    { test: password.length >= 8, text: 'Be at least 8 characters' },
                    { test: /[a-z]/.test(password), text: 'Contain lowercase letter' },
                    { test: /[A-Z]/.test(password), text: 'Contain uppercase letter' },
                    { test: /\d/.test(password), text: 'Contain number' },
                    { test: /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/.test(password), text: 'Contain special character' }
                  ].map((req, i) => (
                    <small 
                      key={i}
                      className="d-block"
                      style={{ 
                        color: req.test ? '#28a745' : '#6c757d',
                        marginLeft: '8px'
                      }}
                    >
                      {req.test ? '✓' : '○'} {req.text}
                    </small>
                  ))}
                </div>
              )}
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group controlId="confirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                isInvalid={confirm && password !== confirm}
                disabled={status === 'sending' || status === 'success'}
                className="auth-input"
                required
              />
              <Form.Control.Feedback type="invalid">
                Passwords do not match
              </Form.Control.Feedback>
            </Form.Group>

            {/* Submit Button */}
            <div className="d-grid mt-4 mb-3">
              <Button
                type="submit"
                className="auth-btn"
                disabled={
                  status === 'sending' || 
                  status === 'success' || 
                  !password || 
                  !confirm ||
                  password !== confirm ||
                  validationErrors.length > 0
                }
              >
                {status === 'sending' ? (
                  <>
                    <Spinner 
                      as="span" 
                      animation="border" 
                      size="sm" 
                      className="me-2" 
                    />
                    Processing...
                  </>
                ) : status === 'success' ? (
                  '✓ Password Reset!'
                ) : (
                  'Reset Password'
                )}
              </Button>
            </div>
          </Form>

          {/* Status Messages */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="success" className="text-center">
                  <Alert.Heading>✅ Success!</Alert.Heading>
                  <p>Your password has been reset. Redirecting to login...</p>
                </Alert>
              </motion.div>
            )}
            
            {status === 'error' && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="danger">
                  <Alert.Heading>⚠️ Error</Alert.Heading>
                  <p>{error}</p>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to Login */}
          <div className="text-center mt-3">
            <Link to="/login" className="auth-link">
              ← Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}