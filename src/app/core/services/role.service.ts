import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../../models/role.model';

export interface CreateRoleRequest {
  name: string;
  description?: string;
  scope?: string;
  companyId?: number;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.apiUrl}/roles`);
  }

  getById(id: number): Observable<Role> {
    return this.http.get<Role>(`${environment.apiUrl}/roles/${id}`);
  }

  getByUuid(uuid: string): Observable<Role> {
    return this.http.get<Role>(`${environment.apiUrl}/roles/by-uuid/${uuid}`);
  }

  create(data: CreateRoleRequest): Observable<Role> {
    return this.http.post<Role>(`${environment.apiUrl}/roles`, data);
  }

  update(id: number, data: UpdateRoleRequest): Observable<Role> {
    return this.http.put<Role>(`${environment.apiUrl}/roles/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/roles/${id}`);
  }
}
