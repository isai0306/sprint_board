import React, { useEffect, useState } from 'react';
import '../styles/settings.css';

type NotificationPrefs = {
  email: boolean;
  inApp: boolean;
  mentionsOnly: boolean;
};

const DEFAULT_PREFS: NotificationPrefs = {
  email: true,
  inApp: true,
  mentionsOnly: false
};

export const SettingsNotificationsPage: React.FC = () => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    const stored = localStorage.getItem('sprintboard_notification_prefs');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as NotificationPrefs;
      setPrefs(parsed);
    } catch {
      // ignore malformed local data
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sprintboard_notification_prefs', JSON.stringify(prefs));
  }, [prefs]);

  return (
    <div className="settings-page">
      <h1>Notification Settings</h1>
      <p>Control how and when Sprint Board notifies you.</p>

      <section className="settings-card">
        <h2>Channels</h2>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={prefs.inApp}
            onChange={(e) => setPrefs((p) => ({ ...p, inApp: e.target.checked }))}
          />
          <span>In-app notifications</span>
        </label>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={prefs.email}
            onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.checked }))}
          />
          <span>Email notifications</span>
        </label>
      </section>

      <section className="settings-card">
        <h2>Behavior</h2>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={prefs.mentionsOnly}
            onChange={(e) => setPrefs((p) => ({ ...p, mentionsOnly: e.target.checked }))}
          />
          <span>Only notify me for @mentions and direct assignment</span>
        </label>
      </section>
    </div>
  );
};
