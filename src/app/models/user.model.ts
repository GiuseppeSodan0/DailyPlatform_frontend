import { UserRoleInfo } from './user-role-info.model';

export interface User {
  id: number;
  uid?: string;
  uuid?: string;
  email: string;
  name: string;
  surname: string;
  status: string;
  companyId?: number;
  companyName?: string;
  sedeOperativaId?: number;
  sedeOperativaName?: string;
  reparto?: string;
  roles: string[];
  roleDetails?: UserRoleInfo[];
  profiles: string[];
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}
