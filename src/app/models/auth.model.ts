export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  name: string;
  surname: string;
  roles: string[];
  permissions: string[];
}

export interface MeResponse {
  id: number;
  email: string;
  name: string;
  surname: string;
  status: string;
  companyId: number;
  companyName: string;
  roles: string[];
  permissions: string[];
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  surname: string;
  status: string;
  companyId: number;
  companyName: string;
  roles: string[];
  permissions: string[];
  avatar?: string;
}
