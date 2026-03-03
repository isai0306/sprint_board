import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../styles/settings.css';

export const SettingsPage: React.FC = () => {
  return (
    <div className="settings-layout">
      <aside className="settings-side">
        <h2>Settings</h2>
        <nav className="settings-nav">
          <NavLink end to="/settings" className="settings-nav-link">
            General
          </NavLink>
          <NavLink to="/settings/notifications" className="settings-nav-link">
            Notifications
          </NavLink>
          <NavLink to="/settings/user-management" className="settings-nav-link">
            User Management
          </NavLink>
        </nav>
      </aside>
      <section className="settings-content">
        <Outlet />
      </section>
    </div>
  );
};
