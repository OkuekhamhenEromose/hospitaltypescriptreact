// contexts/AuthProvider.tsx
import React, { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { User, LoginData, RegisterData, AuthResponse } from "../services/auth";
import { apiService, isTokenExpired } from "../services/api";
import { AuthContext } from "./AuthContext";

// Type guard to check if response has user property
interface DashboardResponse {
  user: User;
  [key: string]: unknown;
}

function isDashboardResponse(obj: unknown): obj is DashboardResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "user" in obj &&
    typeof (obj as DashboardResponse).user === "object"
  );
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      if (isTokenExpired(token)) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken || isTokenExpired(refreshToken)) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setLoading(false);
          return;
        }
        try {
          await apiService.refreshToken();
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setLoading(false);
          return;
        }
      }

      const response = await apiService.getDashboard();
      
      if (isDashboardResponse(response)) {
        setUser(response.user);
      } else if (isDashboardResponse({ user: response })) {
        // Handle case where response itself is the user object
        setUser(response as unknown as User);
      }
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (data: LoginData): Promise<void> => {
    const response: AuthResponse = await apiService.login(data);
    localStorage.setItem("access_token",  response.access);
    localStorage.setItem("refresh_token", response.refresh);
    setUser(response.user);
  }, []);

  const loginWithGoogle = useCallback(async (code: string): Promise<AuthResponse> => {
    const response = await apiService.loginWithGoogle(code);
    setUser(response.user);
    return response;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    await apiService.register(data);
    const loginData: LoginData = { 
      username: data.username, 
      password: data.password1 
    };
    const loginResponse: AuthResponse = await apiService.login(loginData);
    localStorage.setItem("access_token",  loginResponse.access);
    localStorage.setItem("refresh_token", loginResponse.refresh);
    setUser(loginResponse.user);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithGoogle, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};