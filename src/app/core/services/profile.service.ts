import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Profile } from '../../models/profile.model';

export interface CreateProfileRequest {
  code: string;
  name: string;
  description?: string;
  permissions?: AssignProfilePermissionItem[];
}

export interface UpdateProfileRequest {
  name?: string;
  description?: string;
  status?: string;
}

export interface AssignProfilePermissionItem {
  permissionId: number;
  visible: boolean;
  inhibitor: boolean;
}

export interface AssignProfilePermissionsRequest {
  permissions: AssignProfilePermissionItem[];
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${environment.apiUrl}/profiles`);
  }

  getById(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${environment.apiUrl}/profiles/${id}`);
  }

  getByCode(code: string): Observable<Profile> {
    return this.http.get<Profile>(`${environment.apiUrl}/profiles/by-code/${code}`);
  }

  create(data: CreateProfileRequest): Observable<Profile> {
    return this.http.post<Profile>(`${environment.apiUrl}/profiles`, data);
  }

  update(id: number, data: UpdateProfileRequest): Observable<Profile> {
    return this.http.put<Profile>(`${environment.apiUrl}/profiles/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/profiles/${id}`);
  }

  addPermissions(profileId: number, data: AssignProfilePermissionsRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/profiles/${profileId}/permissions`, data);
  }

  removePermission(profileId: number, permissionId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/profiles/${profileId}/permissions/${permissionId}`);
  }
}
