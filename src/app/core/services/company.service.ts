import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Company } from '../../models/company.model';

export interface CreateCompanyRequest {
  uid?: string;
  uuid?: string;
  factoryName?: string;
  partitaIva?: number;
  codiceFiscale?: string;
  codiceUnivoco?: string;
  email?: string;
  pec?: string;
  telefono?: string;
  responsabile?: string;
  sedeOperativa?: string;
  indirizzo?: string;
  civico?: number;
  settore?: string;
  medicoCompetente?: string;
  rspp?: string;
  consulente?: string;
  note?: string;
  cap?: string;
  comune?: string;
  provincia?: string;
  regione?: string;
  nazione?: string;
  codiceAteco?: string;
  numDipendenti?: number;
}

export interface UpdateCompanyRequest {
  uid?: string;
  uuid?: string;
  factoryName?: string;
  partitaIva?: number;
  codiceFiscale?: string;
  codiceUnivoco?: string;
  email?: string;
  pec?: string;
  telefono?: string;
  responsabile?: string;
  sedeOperativa?: string;
  indirizzo?: string;
  civico?: number;
  settore?: string;
  medicoCompetente?: string;
  rspp?: string;
  consulente?: string;
  note?: string;
  cap?: string;
  comune?: string;
  provincia?: string;
  regione?: string;
  nazione?: string;
  codiceAteco?: string;
  numDipendenti?: number;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(`${environment.apiUrl}/companies`);
  }

  getById(id: number): Observable<Company> {
    return this.http.get<Company>(`${environment.apiUrl}/companies/${id}`);
  }

  getByUuid(uuid: string): Observable<Company> {
    return this.http.get<Company>(`${environment.apiUrl}/companies/by-uuid/${uuid}`);
  }

  create(data: CreateCompanyRequest): Observable<Company> {
    return this.http.post<Company>(`${environment.apiUrl}/companies`, data);
  }

  update(id: number, data: UpdateCompanyRequest): Observable<Company> {
    return this.http.put<Company>(`${environment.apiUrl}/companies/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/companies/${id}`);
  }
}
