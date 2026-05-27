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
  uid?: string;
  uuid?: string;
  email: string;
  name: string;
  surname: string;
  roles: string[];
  profiles: string[];
  permissions: string[];
  companyId?: number;
  companyName?: string;
  superAdmin?: boolean;
}

export interface MeResponse {
  id: number;
  uid?: string;
  uuid?: string;
  email: string;
  name: string;
  surname: string;
  status: string;
  companyId?: number;
  companyName?: string;
  superAdmin?: boolean;
  roles: string[];
  profiles: string[];
  permissions: string[];
  avatar?: string;
}

export interface AuthUser {
  id: number;
  uid?: string;
  uuid?: string;
  email: string;
  name: string;
  surname: string;
  status: string;
  companyId?: number;
  companyName?: string;
  superAdmin?: boolean;
  roles: string[];
  profiles: string[];
  permissions: string[];
  avatar?: string;
}
