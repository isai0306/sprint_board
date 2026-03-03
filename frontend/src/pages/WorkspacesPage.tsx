import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { WorkspaceModal } from '../components/workspace/WorkspaceModal';
import '../styles/workspace.css';

type Workspace = {
  id: number;
  name: string;
  description: string | null;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
};

export const WorkspacesPage: React.FC = () => {
  const [items, setItems] = useState<Workspace[]>([]);
  const [open, setOpen] = useState(false);
  const [menuId, setMenuId] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get('/workspaces').then((res) => setItems(res.data.workspaces || []));
  }, []);

  return (
    <div className="workspace-page">
      <div className="workspace-header">
        <h1>Workspaces</h1>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          + Create workspace
        </button>
      </div>
      <div className="workspace-grid">
        {items.map((w) => (
          <div key={w.id} className="workspace-card">
            <div className="workspace-card-header">
              <div className="workspace-card-title">{w.name}</div>
              {w.role === 'ADMIN' && (
                <>
                  <button
                    type="button"
                    className="workspace-card-menu-btn"
                    onClick={() => setMenuId((prev) => (prev === w.id ? null : w.id))}
                  >
                    ⋯
                  </button>
                  {menuId === w.id && (
                    <div className="workspace-card-menu">
                      <button
                        type="button"
                        onClick={async () => {
                          const name = window.prompt('New workspace name', w.name);
                          if (!name) return;
                          const res = await apiClient.patch(`/workspaces/${w.id}`, {
                            name
                          });
                          setItems((prev) =>
                            prev.map((ws) =>
                              ws.id === w.id
                                ? { ...ws, ...res.data.workspace }
                                : ws
                            )
                          );
                          setMenuId(null);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Delete this workspace?')) return;
                          await apiClient.delete(`/workspaces/${w.id}`);
                          setItems((prev) => prev.filter((ws) => ws.id !== w.id));
                          setMenuId(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            {w.description && (
              <div className="workspace-card-desc">{w.description}</div>
            )}
            <span className={`badge-role badge-role-${w.role.toLowerCase()}`}>
              {w.role}
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <div className="workspace-empty">
            You do not belong to any workspaces yet. Create one to start organizing boards.
          </div>
        )}
      </div>
      {open && (
        <WorkspaceModal
          onClose={() => setOpen(false)}
          onCreated={(ws) => setItems((prev) => [ws, ...prev])}
        />
      )}
    </div>
  );
};

