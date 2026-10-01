import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('o2safe_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('o2safe_token');
  });
  const [isLoading, setIsLoading] = useState(false);

  // If no user on first run, auto-populate with default Admin for instant testing convenience
  useEffect(() => {
    if (!user) {
      const defaultAdmin: User = {
        id: 1,
        first_name: 'admin',
        last_name: '01',
        email: 'admin@o2safe.hospital',
        department: 'Test Department',
        position: 'test',
        phone: '0000000008',
        role: 'admin',
        status: 'active'
      };
      setUser(defaultAdmin);
      setToken('demo_token');
      localStorage.setItem('o2safe_user', JSON.stringify(defaultAdmin));
      localStorage.setItem('o2safe_token', 'demo_token');
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('o2safe_user', JSON.stringify(data.user));
      localStorage.setItem('o2safe_token', data.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('o2safe_user');
    localStorage.removeItem('o2safe_token');
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
