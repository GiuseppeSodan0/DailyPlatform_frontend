import { Permission } from './permission.model';

export interface Role {
  id: number;
  name: string;
  description: string;
  systemRole: boolean;
  scope: 'GLOBAL' | 'TENANT';
  status: string;
  companyId?: number;
  permissions: Permission[];
}
