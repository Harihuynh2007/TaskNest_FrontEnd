// src/features/auth/AuthForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../../contexts/AuthContext';
import { useAuthForm } from './hooks/useAuthForm';
import OAuthButtonGroup from './OAuthButtonGroup';
import './AuthStyles.css';

export default function AuthForm({ mode = 'login' }) {
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  const { login, signup } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);

  // -------------------
  // Save account locally
  // -------------------
  const handleSaveAccount = (email) => {
    try {
      const accounts = JSON.parse(localStorage.getItem('savedAccounts')) || [];
      if (!accounts.some(acc => acc.email === email)) {
        const newAcc = {
          email,
          name: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
        };
        localStorage.setItem('savedAccounts', JSON.stringify([newAcc, ...accounts]));
      }
    } catch (e) {
      console.error("Failed to save account:", e);
    }
  };

  const handleAuthSubmit = async ({ email, password }) => {
    if (isLogin) {
      await login(email, password);
      handleSaveAccount(email);
      navigate('/boards');
    } else {
      await signup(email, password);
      navigate('/login?registered=true');
    }
  };

  const {
    formData,
    errors,
    touched,
    isSubmitting,
    apiError,
    handleFieldChange,
    handleBlur,
    handleSubmit,
    clearApiError,
  } = useAuthForm(mode, handleAuthSubmit);

  const { email, password, confirm, remember } = formData;

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Illustration section */}
        <div className="auth-illustration">
          <img src="/login-illustration.png" alt="TaskNest" />
          <h2>Welcome {isLogin ? 'back' : 'aboard'}!</h2>
          <p>{isLogin ? 'Sign in to continue organizing your work.' : 'Create your account to start managing tasks smarter.'}</p>
        </div>

        {/* Form section */}
        <div className="auth-form-side">
          <h3 className="auth-title">{isLogin ? 'Login' : 'Sign Up'}</h3>

          <Form noValidate onSubmit={handleSubmit}>
            {/* Email */}
            <Form.Group className="mb-3" controlId="authEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={email}
                onChange={handleFieldChange}
                onBlur={handleBlur}
                isInvalid={touched.email && !!errors.email}
                autoComplete="username"
                disabled={isSubmitting}
                required
                className="auth-input"
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3" controlId="authPassword">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={handleFieldChange}
                  onBlur={handleBlur}
                  isInvalid={touched.password && !!errors.password}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  disabled={isSubmitting}
                  required
                  className="auth-input"
                />
                <Button
                  variant="link"
                  type="button"
                  className="toggle-eye"
                  onClick={() => setShowPassword(prev => !prev)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Confirm password (register only) */}
            {!isLogin && (
              <Form.Group className="mb-3" controlId="authConfirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="confirm"
                    value={confirm}
                    onChange={handleFieldChange}
                    onBlur={handleBlur}
                    isInvalid={touched.confirm && !!errors.confirm}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    required
                    className="auth-input"
                  />
                  <Button
                    variant="link"
                    type="button"
                    className="toggle-eye"
                    onClick={() => setShowPassword(prev => !prev)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                  <Form.Control.Feedback type="invalid">{errors.confirm}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            )}

            {/* Remember & Forgot */}
            {isLogin && (
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Check
                  type="checkbox"
                  label="Remember me"
                  name="remember"
                  checked={remember}
                  onChange={handleFieldChange}
                  disabled={isSubmitting}
                />
                <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
              </div>
            )}

            {/* Submit */}
            <div className="d-grid mb-3">
              <Button type="submit" className="auth-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" /> Processing...
                  </>
                ) : (
                  isLogin ? 'Login' : 'Sign Up'
                )}
              </Button>
            </div>

            {/* OAuth (login only) */}
            {isLogin && <OAuthButtonGroup />}

            {/* Switch mode */}
            <p className="text-center switch-link">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Link to={isLogin ? '/register' : '/login'} className="fw-bold gradient-text">
                {isLogin ? 'Sign up' : 'Login'}
              </Link>
            </p>
          </Form>
        </div>
      </div>

      {/* Error modal */}
      <Modal show={!!apiError} onHide={clearApiError} centered>
        <Modal.Body className="auth-error-modal">
          <h5>⚠️ Something went wrong</h5>
          <p>{apiError}</p>
          <Button variant="secondary" onClick={clearApiError}>Close</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
