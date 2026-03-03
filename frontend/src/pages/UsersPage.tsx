import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import '../styles/users.css';

type Workspace = {
  id: number;
  name: string;
};

type Member = {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
};

export const UsersPage: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/workspaces').then((res) => {
      const items = Array.isArray(res.data?.workspaces) ? res.data.workspaces : [];
      setWorkspaces(items);
      if (items.length > 0) {
        setWorkspaceId(items[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    apiClient
      .get(`/workspaces/${workspaceId}/members`)
      .then((res) => setMembers(Array.isArray(res.data?.members) ? res.data.members : []))
      .catch(() => setMembers([]));
  }, [workspaceId]);

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase())
      ),
    [members, search]
  );

  const admins = members.filter((m) => m.role === 'ADMIN').length;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setError('');
    try {
      const res = await apiClient.post(`/workspaces/${workspaceId}/members/invite`, {
        email: inviteEmail,
        role: inviteRole
      });
      if (res.data?.member) {
        setMembers((prev) => [res.data.member, ...prev]);
      }
      setInviteEmail('');
      setInviteRole('MEMBER');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Unable to invite user'
      );
    }
  };

  return (
    <div className="users-page">
      <div className="users-head">
        <div>
          <h1>Invite people to your workspace</h1>
          <p>
            Invite teammates to collaborate. Select a role for each invited member.
          </p>
        </div>
        <form className="users-invite" onSubmit={handleInvite}>
          <input
            type="email"
            placeholder="Invite by email address..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)}>
            <option value="MEMBER">Member</option>
            <option value="VIEWER">Viewer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="btn-primary" type="submit">
            Send invite
          </button>
        </form>
      </div>

      <div className="users-toolbar">
        <select
          value={workspaceId ?? ''}
          onChange={(e) => setWorkspaceId(Number(e.target.value))}
        >
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="users-error">{error}</div>}

      <div className="users-stats">
        <div className="users-stat-card">
          <span>Total users</span>
          <strong>{members.length}</strong>
        </div>
        <div className="users-stat-card">
          <span>Active users</span>
          <strong>{members.length}</strong>
        </div>
        <div className="users-stat-card">
          <span>Organization admins</span>
          <strong>{admins}</strong>
        </div>
      </div>

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="users-person">
                    <div className="users-avatar">{m.name.slice(0, 1).toUpperCase()}</div>
                    <div>
                      <div>{m.name}</div>
                      <small>{m.email}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="users-status active">ACTIVE</span>
                </td>
                <td>{m.role}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
