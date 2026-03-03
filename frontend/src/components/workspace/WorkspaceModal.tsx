import React, { useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import '../../styles/modal.css';

type Props = {
  onClose: () => void;
  onCreated: (workspace: any) => void;
};

export const WorkspaceModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await apiClient.post('/workspaces', {
        name,
        description
      });
      onCreated(res.data.workspace);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Create workspace</h2>
        {error && <div className="modal-error">{error}</div>}
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

