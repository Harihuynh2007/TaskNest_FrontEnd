// src/components/auth/AuthForm.jsx

import React, { useState, useContext, useReducer } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, InputGroup, Spinner, Modal
} from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../../contexts/AuthContext';
import { validateField } from './utils/validation';
import OAuthButtonGroup from './OAuthButtonGroup';

// -------------------
// useReducer cho form state
// -------------------
const initialState = {
  email: '',
  password: '',
  confirm: '',
  remember: false,
  errors: { email: '', password: '', confirm: '' },
  touched: { email: false, password: false, confirm: false },
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'FIELD_CHANGE':
      return { ...state, [action.fieldName]: action.payload };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.fieldName]: action.payload } };
    case 'SET_TOUCHED':
      return { ...state, touched: { ...state.touched, [action.fieldName]: true } };
    case 'SUBMIT_VALIDATE':
      return { ...state, errors: action.payload, touched: { email: true, password: true, confirm: true } };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

// -------------------
// Component
// -------------------
export default function AuthForm({ mode = 'login' }) {
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  const { login, signup } = useContext(AuthContext);

  const [state, dispatch] = useReducer(formReducer, initialState);
  const { email, password, confirm, remember, errors, touched } = state;

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // -------------------
  // Field handlers
  // -------------------
  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    dispatch({ type: 'FIELD_CHANGE', fieldName: name, payload: fieldValue });

    if (touched[name]) {
      const error = validateField(name, fieldValue, password);
      dispatch({ type: 'SET_ERROR', fieldName: name, payload: error });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'SET_TOUCHED', fieldName: name });
    const error = validateField(name, value, password);
    dispatch({ type: 'SET_ERROR', fieldName: name, payload: error });
  };

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

  // -------------------
  // Submit handler
  // -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    const confirmError = isLogin ? '' : validateField('confirm', confirm, password);

    dispatch({ type: 'SUBMIT_VALIDATE', payload: { email: emailError, password: passwordError, confirm: confirmError } });

    if (emailError || passwordError || confirmError) return;

    setLoading(true);
    setApiError('');

    try {
      if (isLogin) {
        await login(email, password);
        handleSaveAccount(email);
        navigate('/boards');
      } else {
        await signup(email, password);
        navigate('/login?registered=true');
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------
  // JSX UI (giữ nguyên)
  // -------------------
  return (
    <>
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
        <Row className="w-100 justify-content-center">
          <Col xs={12} md={10} lg={8} xl={6}>
            <Card className="shadow-lg overflow-hidden">
              <Row className="g-0">
                {/* Illustration side */}
                <Col md={6} className="d-none d-md-flex flex-column justify-content-center align-items-center bg-white p-4">
                  <img src="/login-illustration.png" alt="Welcome" className="img-fluid mb-3" style={{ maxWidth: '80%' }} />
                  <h2 className="mb-3">Welcome {isLogin ? 'Back!' : 'Aboard!'}</h2>
                  <p className="text-muted text-center">
                    {isLogin
                      ? 'Log in to continue to your account.'
                      : 'Create an account to get started.'}
                  </p>
                </Col>

                {/* Form side */}
                <Col xs={12} md={6} className="p-4">
                  <h3 className="mb-4 text-center">{isLogin ? 'Login' : 'Sign Up'}</h3>
                  <Form noValidate onSubmit={handleSubmit}>
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
                        required
                      />
                      <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>

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
                          required
                        />
                        <Button variant="outline-secondary" onClick={() => setShowPassword(prev => !prev)}>
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>

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
                            required
                          />
                          <Button variant="outline-secondary" onClick={() => setShowPassword(prev => !prev)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                          <Form.Control.Feedback type="invalid">{errors.confirm}</Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    )}

                    {isLogin && (
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <Form.Check type="checkbox" label="Remember me" name="remember" checked={remember} onChange={handleFieldChange} />
                        <Link to="/forgot-password">Forgot password?</Link>
                      </div>
                    )}

                    <div className="d-grid mb-3">
                      <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Please wait...</> : isLogin ? 'Login' : 'Sign Up'}
                      </Button>
                    </div>

                    {isLogin && <OAuthButtonGroup />}

                    <p className="text-center mb-0">
                      {isLogin ? "Don't have an account? " : 'Already have an account? '}
                      <Link to={isLogin ? '/register' : '/login'} className="fw-bold">{isLogin ? 'Create one' : 'Login'}</Link>
                    </p>
                  </Form>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Error Modal */}
      <Modal show={!!apiError} onHide={() => setApiError('')}>
        <Modal.Header closeButton>
          <Modal.Title>Đã xảy ra lỗi</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ whiteSpace: 'pre-wrap' }}>{apiError}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setApiError('')}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
