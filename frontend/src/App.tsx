import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { BoardPage } from './pages/BoardPage';
import { WorkspacesPage } from './pages/WorkspacesPage';
import { BoardsPage } from './pages/BoardsPage';
import { BacklogPage } from './pages/BacklogPage';
import { TimelinePage } from './pages/TimelinePage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { SettingsGeneralPage } from './pages/SettingsGeneralPage';
import { SettingsNotificationsPage } from './pages/SettingsNotificationsPage';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthLayout>
            <ForgotPasswordPage />
          </AuthLayout>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="workspaces" element={<WorkspacesPage />} />
        <Route path="backlog" element={<BacklogPage />} />
        <Route path="boards" element={<BoardsPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="boards/:boardId" element={<BoardPage />} />
        <Route path="settings" element={<SettingsPage />}>
          <Route index element={<SettingsGeneralPage />} />
          <Route path="notifications" element={<SettingsNotificationsPage />} />
          <Route path="user-management" element={<UsersPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

