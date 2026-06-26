// contexts/AuthContext.ts
import { createContext } from "react";
import type { User, LoginData, RegisterData, AuthResponse } from "../services/auth";

export interface AuthContextType {
  user:            User | null;
  login:           (data: LoginData)    => Promise<void>;
  loginWithGoogle: (code: string)       => Promise<AuthResponse>;
  register:        (data: RegisterData) => Promise<void>;
  logout:          ()                   => void;
  loading:         boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);