import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api, getStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name: string; phone?: string }) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      api
        .getMe()
        .then((res) => setUser(res.user))
        .catch(() => {
          api.logout();
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.register(data);
    setUser(res.user);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateProfile = async (data: { name: string; phone?: string }) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
