// services/auth.ts
export interface User {
  id: number;
  username: string;
  email: string;
  profile?: Profile;
}

export interface Profile {
  fullname: string;
  phone: string;
  gender: string;
  profile_pix: string;
  role: 'PATIENT' | 'DOCTOR' | 'NURSE' | 'LAB' | 'ADMIN';
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password1: string;
  password2: string;
  fullname: string;
  phone?: string;
  gender?: string;
  role: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
export interface DashboardResponse{
  user: User;
}
