export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  status: string;
  companyId: number;
  companyName?: string;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}
