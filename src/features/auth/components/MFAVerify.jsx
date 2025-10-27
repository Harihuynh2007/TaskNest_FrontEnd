// ============================================
// src/features/auth/components/MFAVerify.jsx
// ============================================
import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';

export default function MFAVerify({ onVerify, onUseBackup }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Code must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onVerify(code);
    } catch (err) {
      setError(err.message);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="auth-card"
      style={{ maxWidth: '400px', margin: '100px auto' }}
    >
      <div className="p-4">
        <h3 className="text-center mb-4">Two-Factor Authentication</h3>
        <p className="text-muted text-center">
          Enter the 6-digit code from your authenticator app
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center"
              style={{ fontSize: '32px', letterSpacing: '12px' }}
              autoFocus
            />
          </Form.Group>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          <Button type="submit" variant="primary" className="w-100 mt-3" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Verify'}
          </Button>
        </Form>

        <div className="text-center mt-3">
          <Button variant="link" size="sm" onClick={onUseBackup}>
            Use backup code instead
          </Button>
        </div>
      </div>
    </motion.div>
  );
}