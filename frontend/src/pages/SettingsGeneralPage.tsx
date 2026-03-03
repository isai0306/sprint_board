import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/settings.css';

export const SettingsGeneralPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="settings-page">
      <h1>General Settings</h1>
      <p>Manage application preferences and workspace behavior.</p>

      <section className="settings-card">
        <h2>Profile</h2>
        <div className="settings-row">
          <span>Name</span>
          <strong>{user?.name}</strong>
        </div>
        <div className="settings-row">
          <span>Email</span>
          <strong>{user?.email}</strong>
        </div>
        <div className="settings-row">
          <span>Role</span>
          <strong>{user?.role}</strong>
        </div>
      </section>

      <section className="settings-card">
        <h2>Preferences</h2>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          <span>Email notifications</span>
        </label>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={compactMode}
            onChange={(e) => setCompactMode(e.target.checked)}
          />
          <span>Compact board cards</span>
        </label>
      </section>
    </div>
  );
};
