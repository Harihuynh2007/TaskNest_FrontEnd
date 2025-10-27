import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import { enableMFA, verifyMFASetup } from '../../../api/authApi';

export default function MFASetup({ show, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) loadQRCode();
  }, [show]);

  const loadQRCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await enableMFA();
      setQrCodeData(res.qr_code_url);
      setSecret(res.secret);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (verifyCode.length !== 6) {
      setError('Code must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await verifyMFASetup(verifyCode);
      setBackupCodes(res.backup_codes);
      setStep(4);
    } catch (err) {
      setError(err.message);
      setVerifyCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onSuccess?.();
    onClose();
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasknest-backup-codes.txt';
    a.click();
  };

  return (
    <Modal show={show} onHide={onClose} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>Enable Two-Factor Authentication</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {step === 1 && (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-3">Generating QR code...</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h5>Step 1: Scan QR Code</h5>
            <p className="text-muted">
              Use Google Authenticator, Authy, or any TOTP app to scan:
            </p>
            <div className="text-center my-3">
              <QRCode value={qrCodeData} size={200} />
            </div>
            <Alert variant="info">
              <strong>Manual Entry:</strong>
              <code className="d-block mt-2">{secret}</code>
            </Alert>
            <Button variant="primary" onClick={() => setStep(3)} className="w-100">
              Next: Verify Code
            </Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h5>Step 2: Verify Setup</h5>
            <p className="text-muted">Enter the 6-digit code from your app:</p>
            <Form onSubmit={handleVerify}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center"
                  style={{ fontSize: '24px', letterSpacing: '8px' }}
                  autoFocus
                />
              </Form.Group>
              {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
              <Button type="submit" variant="primary" className="w-100 mt-3" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </Form>
          </div>
        )}

        {step === 4 && (
          <div>
            <h5>✅ MFA Enabled Successfully!</h5>
            <Alert variant="warning">
              <strong>⚠️ Save These Backup Codes</strong>
              <p className="mb-0">Use these if you lose access to your authenticator app.</p>
            </Alert>
            <div className="backup-codes p-3 bg-light rounded">
              {backupCodes.map((code, i) => (
                <code key={i} className="d-block">{code}</code>
              ))}
            </div>
            <div className="d-grid gap-2 mt-3">
              <Button variant="outline-primary" onClick={downloadBackupCodes}>
                Download Codes
              </Button>
              <Button variant="primary" onClick={handleComplete}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}