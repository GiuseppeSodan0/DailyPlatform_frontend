import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SorveglianzaSanitaria, CreateSorveglianzaSanitariaRequest, UpdateSorveglianzaSanitariaRequest } from '../../models/sorveglianza-sanitaria.model';

@Injectable({ providedIn: 'root' })
export class SorveglianzaSanitariaService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<SorveglianzaSanitaria[]> {
    return this.http.get<SorveglianzaSanitaria[]>(`${environment.apiUrl}/sorveglianza-sanitaria`);
  }

  getById(id: number): Observable<SorveglianzaSanitaria> {
    return this.http.get<SorveglianzaSanitaria>(`${environment.apiUrl}/sorveglianza-sanitaria/${id}`);
  }

  create(data: CreateSorveglianzaSanitariaRequest): Observable<SorveglianzaSanitaria> {
    return this.http.post<SorveglianzaSanitaria>(`${environment.apiUrl}/sorveglianza-sanitaria`, data);
  }

  update(id: number, data: UpdateSorveglianzaSanitariaRequest): Observable<SorveglianzaSanitaria> {
    return this.http.put<SorveglianzaSanitaria>(`${environment.apiUrl}/sorveglianza-sanitaria/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/sorveglianza-sanitaria/${id}`);
  }

  uploadAllegato(id: number, file: File): Observable<SorveglianzaSanitaria> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<SorveglianzaSanitaria>(`${environment.apiUrl}/sorveglianza-sanitaria/${id}/allegato`, formData);
  }
}
