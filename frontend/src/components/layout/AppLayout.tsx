import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SearchProvider } from '../../context/SearchContext';
import '../../styles/layout.css';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <SearchProvider>
          <Topbar />
          <main className="app-content">
            <Outlet />
          </main>
        </SearchProvider>
      </div>
    </div>
  );
};

