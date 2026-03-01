// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { User, LoginData, RegisterData, AuthResponse } from "../services/auth";
import { apiService, isTokenExpired } from "../services/api";

interface AuthContextType {
  user:            User | null;
  login:           (data: LoginData)    => Promise<void>;
  loginWithGoogle: (code: string)       => Promise<any>;
  register:        (data: RegisterData) => Promise<void>;
  logout:          ()                   => void;
  loading:         boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");

      // FIX: If there's no token at all, skip the network call immediately.
      if (!token) return;

      // FIX: Decode the JWT expiry client-side before making any request.
      // If the access token is already expired, attempt a silent refresh using
      // the refresh token. If the refresh token is also absent or expired,
      // clear storage and bail out — no network round-trip wasted.
      if (isTokenExpired(token)) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken || isTokenExpired(refreshToken)) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          return;
        }
        // Silent refresh — getDashboard will retry automatically on 401, but
        // doing it here means the token in localStorage is fresh before we
        // even attempt the dashboard call.
        try {
          await apiService.refreshToken();
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          return;
        }
      }

      const response = await apiService.getDashboard();
      if (response && typeof response === "object") {
        const userData = "user" in response ? (response as any).user : response;
        setUser(userData);
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

  const login = useCallback(async (data: LoginData) => {
    const response: AuthResponse = await apiService.login(data);
    localStorage.setItem("access_token",  response.access);
    localStorage.setItem("refresh_token", response.refresh);
    setUser(response.user);
  }, []);

  const loginWithGoogle = useCallback(async (code: string) => {
    const response = await apiService.loginWithGoogle(code);
    setUser(response.user);
    return response;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await apiService.register(data);
    const loginData: LoginData = { username: data.username, password: data.password1 };
    const loginResponse: AuthResponse = await apiService.login(loginData);
    localStorage.setItem("access_token",  loginResponse.access);
    localStorage.setItem("refresh_token", loginResponse.refresh);
    setUser(loginResponse.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch { /* ignore */ } finally {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};