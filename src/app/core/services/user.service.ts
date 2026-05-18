import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  surname: string;
  status?: string;
  companyId?: number;
  roleIds?: number[];
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  surname?: string;
  password?: string;
  status?: string;
  companyId?: number;
  roleIds?: number[];
}

export interface AssignRolesRequest {
  roleIds: number[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  create(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, data);
  }

  update(id: number, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${id}`);
  }

  addRoles(userId: number, data: AssignRolesRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/users/${userId}/roles`, data);
  }

  removeRole(userId: number, roleId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${userId}/roles/${roleId}`);
  }
}
