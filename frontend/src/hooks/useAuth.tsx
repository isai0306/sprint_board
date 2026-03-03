import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sprintboard_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const userData = res.data.user ?? {};
    const authUser: AuthUser = {
      id: res.data.userId ?? userData.id,
      name: res.data.name ?? userData.name,
      email: res.data.email ?? userData.email,
      role: res.data.role ?? userData.globalRole ?? 'USER'
    };
    setUser(authUser);
    localStorage.setItem('sprintboard_user', JSON.stringify(authUser));
    localStorage.setItem('sprintboard_token', res.data.token ?? res.data.accessToken ?? '');
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiClient.post('/auth/register', { name, email, password });
    const userData = res.data.user ?? {};
    const authUser: AuthUser = {
      id: res.data.userId ?? userData.id,
      name: res.data.name ?? userData.name,
      email: res.data.email ?? userData.email,
      role: res.data.role ?? userData.globalRole ?? 'USER'
    };
    setUser(authUser);
    localStorage.setItem('sprintboard_user', JSON.stringify(authUser));
    localStorage.setItem('sprintboard_token', res.data.token ?? res.data.accessToken ?? '');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sprintboard_user');
    localStorage.removeItem('sprintboard_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
