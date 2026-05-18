import { User } from './user.model';

export interface UserExportDto {
  id: number;
  email: string;
  name: string;
  surname: string;
  status: string;
  companyName: string | null;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserImportDto {
  email: string;
  name: string;
  surname: string;
  password?: string;
  status?: string;
  companyName?: string;
  roles?: string[];
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}
