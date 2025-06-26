// src/components/auth/AuthForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


export default function AuthForm({ mode = 'login', baseUrl = '' }) {
  const navigate = useNavigate();
  const isLogin = mode === 'login';

  // form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && password !== confirm) {
      alert('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      // TODO: call your API here, e.g.
      // const url = `${baseUrl}/auth/${mode}`;
      // await fetch(url, { method: 'POST', body: JSON.stringify({ email, password, remember }) });
      console.log({ email, password, remember });
      navigate(isLogin ? '/dashboard' : '/login');
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={10} lg={8} xl={6}>
          <Card className="shadow-lg overflow-hidden">
            <Row className="g-0">
              {/* Illustration side */}
              <Col
                md={6}
                className="d-none d-md-flex flex-column justify-content-center align-items-center bg-white p-4"
              >
                <img
                    src="/loginregister.png"
                    alt="Welcome Illustration"
                    className="img-fluid mb-3"
                    style={{ maxWidth: '100%' }}
                />
                <h2 className="mb-3">Welcome Back!</h2>
                <p className="text-muted text-center">
                  {isLogin
                    ? 'Log in to continue to your account.'
                    : 'Create an account to get started.'}
                </p>
                {/* You can place an image here */}
              </Col>

              {/* Form side */}
              <Col xs={12} md={6} className="p-4">
                <h3 className="mb-4 text-center">
                  {isLogin ? 'Login' : 'Sign Up'}
                </h3>

                <Form onSubmit={handleSubmit}>
                  {/* Email */}
                  <Form.Group className="mb-2" controlId="authEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-2" controlId="authPassword">
                    <Form.Label>Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  {/* Confirm Password (register only) */}
                  {!isLogin && (
                    <Form.Group
                      className="mb-2"
                      controlId="authConfirmPassword"
                    >
                      <Form.Label>Confirm Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={confirm}
                          onChange={(e) =>
                            setConfirm(e.target.value)
                          }
                          required
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  )}

                  {/* Remember me & Forgot password */}
                  {isLogin && (
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Remember me"
                        checked={remember}
                        onChange={(e) =>
                          setRemember(e.target.checked)
                        }
                      />
                      <Link to="/forgot-password">
                        Forgot password?
                      </Link>
                    </div>
                  )}
                  
                  {/* Submit */}
                  <div className="d-grid mb-3">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading
                        ? 'Please wait...'
                        : isLogin
                        ? 'Login'
                        : 'Sign Up'}
                    </Button>
                  </div>
                  <div className="d-flex align-items-center my-3">
                    <hr className="flex-grow-1" />
                    <span className="mx-2 text-muted">Or continue with:</span>
                    <hr className="flex-grow-1" />
                  </div>

                  {/* Social login (login only) */}
                  {isLogin && (
                    <div className="d-grid gap-2 mb-3">
                      <Button variant="outline-danger">
                        Google
                      </Button>
                      <Button variant="outline-dark">
                        GitHub
                      </Button>
                      <Button variant="outline-primary">
                        Facebook
                      </Button>
                    </div>
                  )}

                  {/* Switch mode link */}
                  <p className="text-center mb-0">
                    {isLogin
                      ? "Don't have an account? "
                      : 'Already have an account? '}
                    <Link
                      to={isLogin ? '/register' : '/login'}
                      className="fw-bold"
                    >
                      {isLogin
                        ? 'Create an account'
                        : 'Login'}
                    </Link>
                  </p>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
