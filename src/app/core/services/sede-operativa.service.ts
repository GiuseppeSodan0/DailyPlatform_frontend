import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SedeOperativa } from '../../models/sede-operativa.model';
import { Reparto } from '../../models/reparto.enum';

export interface CreateSedeOperativaRequest {
  nomeSede: string;
  indirizzo: string;
  civico: number;
  responsabileSede?: string;
  reparti: Reparto;
  cap?: number;
  comune?: string;
  provincia?: string;
  regione?: string;
  nazione?: string;
}

export interface UpdateSedeOperativaRequest {
  nomeSede?: string;
  indirizzo?: string;
  civico?: number;
  responsabileSede?: string;
  reparti?: Reparto;
  cap?: number;
  comune?: string;
  provincia?: string;
  regione?: string;
  nazione?: string;
}

@Injectable({ providedIn: 'root' })
export class SedeOperativaService {
  constructor(private http: HttpClient) {}

  private baseUrl(companyId: number): string {
    return `${environment.apiUrl}/companies/${companyId}/sedi-operative`;
  }

  getAll(): Observable<SedeOperativa[]> {
    return this.http.get<SedeOperativa[]>(`${environment.apiUrl}/sedi-operative`);
  }

  getByCompanyId(companyId: number): Observable<SedeOperativa[]> {
    return this.http.get<SedeOperativa[]>(this.baseUrl(companyId));
  }

  getById(companyId: number, id: number): Observable<SedeOperativa> {
    return this.http.get<SedeOperativa>(`${this.baseUrl(companyId)}/${id}`);
  }

  create(companyId: number, data: CreateSedeOperativaRequest): Observable<SedeOperativa> {
    return this.http.post<SedeOperativa>(this.baseUrl(companyId), data);
  }

  update(companyId: number, id: number, data: UpdateSedeOperativaRequest): Observable<SedeOperativa> {
    return this.http.put<SedeOperativa>(`${this.baseUrl(companyId)}/${id}`, data);
  }

  delete(companyId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(companyId)}/${id}`);
  }
}
