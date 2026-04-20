import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { IUser, AuthTokens } from '@shared/types/index';
import type { RegisterCreateOrgInput, RegisterJoinOrgInput } from '@shared/validation/index';

interface AuthContextType {
  user: IUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerCreateOrg: (data: RegisterCreateOrgInput) => Promise<void>;
  registerJoinOrg: (data: RegisterJoinOrgInput) => Promise<void>;
  logout: () => void;
  updateUser: (user: IUser) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTokens = localStorage.getItem('tokens');
    const savedUser = localStorage.getItem('user');

    if (savedTokens && savedUser) {
      setTokens(JSON.parse(savedTokens));
      setUser(JSON.parse(savedUser));

      api.get('/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('tokens');
          localStorage.removeItem('user');
          setUser(null);
          setTokens(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, tokens: tokenData } = res.data;
    setUser(userData);
    setTokens(tokenData);
    localStorage.setItem('tokens', JSON.stringify(tokenData));
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const registerCreateOrg = useCallback(async (data: RegisterCreateOrgInput) => {
    const res = await api.post('/auth/register-create-org', data);
    const { user: userData, tokens: tokenData } = res.data;
    setUser(userData);
    setTokens(tokenData);
    localStorage.setItem('tokens', JSON.stringify(tokenData));
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const registerJoinOrg = useCallback(async (data: RegisterJoinOrgInput) => {
    const res = await api.post('/auth/register-join-org', data);
    const { user: userData, tokens: tokenData } = res.data;
    setUser(userData);
    setTokens(tokenData);
    localStorage.setItem('tokens', JSON.stringify(tokenData));
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {});
    setUser(null);
    setTokens(null);
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
  }, []);

  const updateUser = useCallback((updatedUser: IUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, tokens, isLoading, login, registerCreateOrg, registerJoinOrg, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
