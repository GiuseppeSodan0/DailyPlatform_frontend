export interface Role {
  id: number;
  uid?: string;
  uuid?: string;
  name: string;
  description: string;
  systemRole: boolean;
  scope: 'GLOBAL' | 'TENANT';
  status: string;
  companyId?: number;
  companyName?: string;
}
