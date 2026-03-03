import React, { useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import '../../styles/modal.css';

type Props = {
  onClose: () => void;
  onCreated: (board: any) => void;
};

export const BoardModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [workspaces, setWorkspaces] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    apiClient
      .get('/workspaces')
      .then((res) => {
        const items = Array.isArray(res.data?.workspaces) ? res.data.workspaces : [];
        const normalized = items.map((w: any) => ({ id: w.id, name: w.name }));
        setWorkspaces(normalized);
        if (normalized.length > 0) {
          setWorkspaceId(normalized[0].id);
        }
      })
      .catch(() => {
        setWorkspaces([]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!workspaceId) {
      setError('Please create/select a workspace first');
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.post('/boards', {
        workspaceId,
        name,
        description
      });
      onCreated(res.data?.board ?? res.data);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Create board</h2>
        {error && <div className="modal-error">{error}</div>}
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Workspace
            <select
              value={workspaceId ?? ''}
              onChange={(e) => setWorkspaceId(Number(e.target.value))}
              required
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
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
              {loading ? 'Creating…' : 'Create board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
