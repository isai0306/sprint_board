import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/sidebar.css';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">SB</div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className="sidebar-link">
          Dashboard
        </NavLink>
        <NavLink to="/workspaces" className="sidebar-link">
          Workspaces
        </NavLink>
        <NavLink to="/boards" className="sidebar-link">
          Boards
        </NavLink>
        <NavLink to="/settings" className="sidebar-link">
          Settings
        </NavLink>
      </nav>
    </aside>
  );
};

