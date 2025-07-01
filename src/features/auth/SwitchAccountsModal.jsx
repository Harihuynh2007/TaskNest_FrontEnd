
import React, { useState } from 'react';
import * as authApi from '../../api/authApi';

export default function SwitchAccountsModal({ onSwitch, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.switchAccount({ email });
      onSwitch(res.data);
    } catch (err) {
      console.error('Error switching account:', err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>Switch Account</h2>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Switching...' : 'Switch'}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
