import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (idToken: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as Partial<User> & {
          roll_number?: string;
          student_name?: string;
          admin_name?: string;
        };

        const inferredRole: UserRole =
          parsed.role ?? (parsed.admin_name ? 'admin' : 'student');

        const normalizedUser: User = {
          id: parsed.id || parsed.roll_number || parsed.email || '',
          email: parsed.email || '',
          role: inferredRole,
          name: parsed.name || parsed.student_name || parsed.admin_name,
        };

        if (normalizedUser.email && normalizedUser.id) {
          setToken(savedToken);
          setUser(normalizedUser);
          localStorage.setItem('auth_user', JSON.stringify(normalizedUser));
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (idToken: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken, role }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Login failed: ${response.statusText}`);
      }

      const { token: jwtToken, user: userData } = data;

      if (!jwtToken || !userData) {
        throw new Error('Invalid response from server');
      }

      const normalizedUser: User = {
        id: userData.roll_number || userData.email,
        email: userData.email,
        role,
        name: userData.student_name || userData.admin_name,
      };

      // Store token and normalized user
      localStorage.setItem('auth_token', jwtToken);
      localStorage.setItem('auth_user', JSON.stringify(normalizedUser));

      setToken(jwtToken);
      setUser(normalizedUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
