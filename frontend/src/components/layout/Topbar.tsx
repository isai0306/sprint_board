import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSearch } from '../../context/SearchContext';
import '../../styles/topbar.css';

type NotificationItem = {
  id: number;
  title: string;
  at: string;
};

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { query, setQuery } = useSearch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('sprintboard_theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('sprintboard_theme', theme);
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem('sprintboard_notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as NotificationItem[];
        setNotifications(Array.isArray(parsed) ? parsed : []);
        return;
      } catch {
        // ignore malformed local data
      }
    }

    const seed: NotificationItem[] = [
      { id: 1, title: 'Board updated by teammate', at: 'Just now' },
      { id: 2, title: 'Task assigned to you', at: '5m ago' }
    ];
    setNotifications(seed);
    localStorage.setItem('sprintboard_notifications', JSON.stringify(seed));
  }, []);

  const handleClearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('sprintboard_notifications', JSON.stringify([]));
  };

  return (
    <header className="topbar">
      <div className="topbar-title">Sprint Board</div>
      <div className="topbar-right">
        <div className="topbar-search">
          <input
            placeholder="Search boards and tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="topbar-theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <div className="topbar-actions">
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3a5 5 0 0 0-5 5v3.8l-1.6 2.4a1 1 0 0 0 .83 1.56h11.54a1 1 0 0 0 .83-1.56L17 11.8V8a5 5 0 0 0-5-5zm0 18a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 21z" />
            </svg>
            {notifications.length > 0 && (
              <span className="topbar-badge">{notifications.length}</span>
            )}
          </button>
          <Link to="/settings" className="topbar-icon-btn" aria-label="Settings">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19.14 12.94a7.94 7.94 0 0 0 .06-.94 7.94 7.94 0 0 0-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.14 7.14 0 0 0-1.63-.94L14.4 2.8a.5.5 0 0 0-.49-.4h-3.82a.5.5 0 0 0-.49.4l-.36 2.52a7.14 7.14 0 0 0-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.7 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.94 7.94 0 0 0-.06.94c0 .32.02.63.06.94L2.82 14.52a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.39 1.05.72 1.63.94l.36 2.52a.5.5 0 0 0 .49.4h3.82a.5.5 0 0 0 .49-.4l.36-2.52c.58-.22 1.13-.55 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z" />
            </svg>
          </Link>
          {showNotifications && (
            <div className="topbar-notifications-panel">
              <div className="topbar-notifications-head">
                <strong>Notifications</strong>
                <button type="button" onClick={handleClearNotifications}>
                  Clear all
                </button>
              </div>
              <div className="topbar-notifications-list">
                {notifications.length === 0 && (
                  <div className="topbar-notification-empty">No notifications</div>
                )}
                {notifications.map((n) => (
                  <div key={n.id} className="topbar-notification-item">
                    <div>{n.title}</div>
                    <small>{n.at}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {user && (
          <div className="topbar-profile">
            <div className="topbar-avatar">
              {user.name
                .split(' ')
                .map((p) => p[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="topbar-user">
              <span className="topbar-name">{user.name}</span>
              <button className="topbar-logout" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
