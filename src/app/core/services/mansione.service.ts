import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Mansione, CreateMansioneRequest, UpdateMansioneRequest } from '../../models/mansione.model';

@Injectable({ providedIn: 'root' })
export class MansioneService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Mansione[]> {
    return this.http.get<Mansione[]>(`${environment.apiUrl}/mansioni`);
  }

  getById(id: number): Observable<Mansione> {
    return this.http.get<Mansione>(`${environment.apiUrl}/mansioni/${id}`);
  }

  search(q: string): Observable<Mansione[]> {
    return this.http.get<Mansione[]>(`${environment.apiUrl}/mansioni/search`, {
      params: { q },
    });
  }

  create(data: CreateMansioneRequest): Observable<Mansione> {
    return this.http.post<Mansione>(`${environment.apiUrl}/mansioni`, data);
  }

  update(id: number, data: UpdateMansioneRequest): Observable<Mansione> {
    return this.http.put<Mansione>(`${environment.apiUrl}/mansioni/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/mansioni/${id}`);
  }
}
