import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Formazione, CreateFormazioneRequest, UpdateFormazioneRequest } from '../../models/formazione.model';

@Injectable({ providedIn: 'root' })
export class FormazioneService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Formazione[]> {
    return this.http.get<Formazione[]>(`${environment.apiUrl}/formazione`);
  }

  getById(id: number): Observable<Formazione> {
    return this.http.get<Formazione>(`${environment.apiUrl}/formazione/${id}`);
  }

  create(data: CreateFormazioneRequest): Observable<Formazione> {
    return this.http.post<Formazione>(`${environment.apiUrl}/formazione`, data);
  }

  update(id: number, data: UpdateFormazioneRequest): Observable<Formazione> {
    return this.http.put<Formazione>(`${environment.apiUrl}/formazione/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/formazione/${id}`);
  }

  uploadAllegato(id: number, file: File): Observable<Formazione> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Formazione>(`${environment.apiUrl}/formazione/${id}/allegato`, formData);
  }
}
