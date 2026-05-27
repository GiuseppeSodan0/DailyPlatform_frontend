import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Policy } from '../../models/policy.model';

export interface CreatePolicyRequest {
  name: string;
  description?: string;
  expression: string;
  targetEntity?: string;
  targetAction?: string;
  priority?: number;
  companyId?: number;
}

@Injectable({ providedIn: 'root' })
export class PolicyService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${environment.apiUrl}/policies`);
  }

  getById(id: number): Observable<Policy> {
    return this.http.get<Policy>(`${environment.apiUrl}/policies/${id}`);
  }

  getByTarget(targetEntity: string, targetAction: string): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${environment.apiUrl}/policies/by-target`, {
      params: { targetEntity, targetAction },
    });
  }

  create(data: CreatePolicyRequest): Observable<Policy> {
    return this.http.post<Policy>(`${environment.apiUrl}/policies`, data);
  }

  update(id: number, data: CreatePolicyRequest): Observable<Policy> {
    return this.http.put<Policy>(`${environment.apiUrl}/policies/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/policies/${id}`);
  }
}
