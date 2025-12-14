// contexts/AuthContext.tsx - Updated to use apiService for Google login
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type {
  User,
  LoginData,
  RegisterData,
  AuthResponse,
} from "../services/auth";
import { apiService } from "../services/api";

interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<any>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiService.getDashboard();

      if (response && typeof response === "object") {
        let userData;
        if ("user" in response) {
          userData = (response as any).user;
        } else {
          setUser(response as any);
        }
        console.log("🔍 DASHBOARD USER DATA:", userData);
        console.log(
          "🔍 DASHBOARD PROFILE IMAGE:",
          userData.profile?.profile_pix
        );

        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
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
    localStorage.setItem("access_token", response.access);
    localStorage.setItem("refresh_token", response.refresh);

    console.log("🔍 LOGIN RESPONSE USER:", response.user);
    console.log("🔍 USER PROFILE:", response.user.profile);
    console.log("🔍 PROFILE IMAGE:", response.user.profile?.profile_pix);

    setUser(response.user);
  }, []);

  const loginWithGoogle = useCallback(async (code: string) => {
    try {
      console.log("🔐 Processing Google auth code:", code.substring(0, 20) + "...");

      // Use the apiService method instead of direct fetch
      const response = await apiService.loginWithGoogle(code);
      
      console.log("✅ Google login successful:", response);
      console.log("🔍 Google login user:", response.user);
      
      setUser(response.user);
      
      return response;
    } catch (error: any) {
      console.error("❌ Google login error:", error);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      await apiService.register(data);
      const loginResponse: AuthResponse = await apiService.login({
        username: data.username,
        password: data.password1,
      });

      localStorage.setItem("access_token", loginResponse.access);
      localStorage.setItem("refresh_token", loginResponse.refresh);
      setUser(loginResponse.user);
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithGoogle,
      register, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};