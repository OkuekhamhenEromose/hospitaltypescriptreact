// contexts/AuthContext.tsx - Updated with dashboard redirect
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginData, RegisterData, AuthResponse } from '../services/auth';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiService.getDashboard();
      
      if (response && typeof response === 'object') {
        if ('user' in response) {
          setUser((response as any).user);
        } else {
          setUser(response as any);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (data: LoginData) => {
    const response: AuthResponse = await apiService.login(data);
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    
    setUser(response.user);
    
    // Redirect to dashboard after successful login
    window.location.href = '/dashboard';
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      await apiService.register(data);
      const loginResponse: AuthResponse = await apiService.login({ 
        username: data.username, 
        password: data.password1 
      });
      
      localStorage.setItem('access_token', loginResponse.access);
      localStorage.setItem('refresh_token', loginResponse.refresh);
      setUser(loginResponse.user);
      
      // Redirect to dashboard after successful registration
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
      // Redirect to home page after logout
      window.location.href = '/';
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};