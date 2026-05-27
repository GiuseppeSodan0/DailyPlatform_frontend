import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  sedeOperativaId?: number | null;
  reparto?: string | null;
  roleIds?: number[];
  profileIds?: number[];
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  surname?: string;
  password?: string;
  status?: string;
  companyId?: number;
  sedeOperativaId?: number | null;
  reparto?: string | null;
  roleIds?: number[];
  profileIds?: number[];
}

export interface AssignRolesRequest {
  roleIds: number[];
}

export interface AssignProfilesRequest {
  profileIds: number[];
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

  getByUuid(uuid: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/by-uuid/${uuid}`);
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

  addProfiles(userId: number, data: AssignProfilesRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/users/${userId}/profiles`, data);
  }

  removeProfile(userId: number, profileId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${userId}/profiles/${profileId}`);
  }

  assignSedeToUser(userId: number, sedeId: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/users/${userId}/assign-sede/${sedeId}`, {});
  }

  assignSedeEReparto(userId: number, payload: { sedeId: number; reparto: string }): Observable<void> {
    const params = new HttpParams()
      .set('sedeId', payload.sedeId.toString())
      .set('reparto', payload.reparto);
    return this.http.post<void>(`${environment.apiUrl}/users/${userId}/assign-sede-reparto`, null, { params });
  }

  getBySedeOperativaId(sedeOperativaId: number): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users/by-sede-operativa/${sedeOperativaId}`);
  }

  getByRole(roleName: string): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users/by-role/${roleName}`);
  }
}
