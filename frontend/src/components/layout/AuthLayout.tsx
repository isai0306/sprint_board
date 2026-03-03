import React from 'react';
import '../../styles/auth.css';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-brand">Sprint Board</div>
        {children}
      </div>
    </div>
  );
};

