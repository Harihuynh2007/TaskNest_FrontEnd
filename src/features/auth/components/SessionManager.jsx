import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useSessions } from '../hooks/useSessions';
import './SessionManager.css';

export default function SessionManager() {
  const { sessions, loading, error, revoke, revokeAll } = useSessions();
  const [revoking, setRevoking] = useState(null);

  const handleRevoke = async (sessionId) => {
    setRevoking(sessionId);
    try {
      await revoke(sessionId);
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!window.confirm('Revoke all other sessions? You will stay logged in on this device.')) return;
    await revokeAll();
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="session-manager">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Active Sessions</h4>
        {sessions.length > 1 && (
          <Button variant="outline-danger" size="sm" onClick={handleRevokeAll}>
            Revoke All Others
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Alert variant="info">No active sessions</Alert>
      ) : (
        <div className="sessions-list">
          {sessions.map((session) => (
            <Card key={session.id} className="mb-2">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <strong>{session.device}</strong>
                      {session.is_current && <Badge bg="success">Current</Badge>}
                    </div>
                    <small className="text-muted d-block">
                      📍 {session.location || 'Unknown location'}
                    </small>
                    <small className="text-muted d-block">
                      🌐 {session.ip_address}
                    </small>
                    <small className="text-muted d-block">
                      🕐 Last active: {new Date(session.last_activity).toLocaleString()}
                    </small>
                  </div>
                  {!session.is_current && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRevoke(session.id)}
                      disabled={revoking === session.id}
                    >
                      {revoking === session.id ? 'Revoking...' : 'Revoke'}
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}