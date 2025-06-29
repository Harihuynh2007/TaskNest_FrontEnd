// src/features/boards/CreateBoardModal.jsx
import React, { useState } from 'react';
import * as boardApi from '../../api/boardApi';

export default function CreateBoardModal({ workspaceId, onCreate, onClose }) {
  const [name, setName]         = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await boardApi.createBoard(workspaceId, { name, description });
      onCreate(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>New Board</h2>
          <div>
            <label>Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? '...' : 'Create'}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}
