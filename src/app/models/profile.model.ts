import { Permission } from './permission.model';

export interface Profile {
  id: number;
  uid?: string;
  uuid?: string;
  code: string;
  name: string;
  description: string;
  status: string;
  permissions: Permission[];
}
