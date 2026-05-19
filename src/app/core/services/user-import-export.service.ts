import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
import { UserExportDto, UserImportDto, ImportResult } from '../../models/user-import-export.model';
import { CreateUserRequest } from './user.service';

@Injectable({ providedIn: 'root' })
export class UserImportExportService {
  private http = inject(HttpClient);

  exportToJson(data: UserExportDto | UserExportDto[], filename: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  toExportDto(user: User): UserExportDto {
    return {
      id: user.id,
      uid: user.uid,
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      surname: user.surname,
      status: user.status,
      companyName: user.companyName ?? null,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  parseFile(file: File): Promise<UserImportDto[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          const items = Array.isArray(parsed) ? parsed : [parsed];
          resolve(items as UserImportDto[]);
        } catch {
          reject(new Error('Il file non contiene JSON valido'));
        }
      };
      reader.onerror = () => reject(new Error('Errore nella lettura del file'));
      reader.readAsText(file);
    });
  }

  validate(dtos: UserImportDto[]): { valid: UserImportDto[]; errors: { row: number; message: string }[] } {
    const valid: UserImportDto[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < dtos.length; i++) {
      const dto = dtos[i];
      const row = i + 1;
      const rowErrors: string[] = [];

      if (!dto.email || typeof dto.email !== 'string') rowErrors.push('Email mancante o non valida');
      if (!dto.name || typeof dto.name !== 'string') rowErrors.push('Nome mancante');
      if (!dto.surname || typeof dto.surname !== 'string') rowErrors.push('Cognome mancante');

      if (rowErrors.length > 0) {
        errors.push({ row, message: rowErrors.join('; ') });
      } else {
        valid.push({
          email: dto.email.trim().toLowerCase(),
          name: dto.name.trim(),
          surname: dto.surname.trim(),
          password: dto.password || 'Imported@123',
          status: dto.status || 'ACTIVE',
        });
      }
    }

    return { valid, errors };
  }

  importUsers(dtos: UserImportDto[]): Observable<ImportResult> {
    const requests = dtos.map((dto) => {
      const body: CreateUserRequest = {
        email: dto.email,
        password: dto.password ?? 'Imported@123',
        name: dto.name,
        surname: dto.surname,
        status: dto.status || 'ACTIVE',
      };
      return this.http.post(`${environment.apiUrl}/users`, body).pipe(
        catchError(() => of(null))
      );
    });

    return new Observable<ImportResult>(observer => {
      if (requests.length === 0) {
        observer.next({ success: 0, failed: 0, errors: [] });
        observer.complete();
        return;
      }
      forkJoin(requests).subscribe({
        next: (results) => {
          const success = results.filter(r => r !== null).length;
          observer.next({
            success,
            failed: dtos.length - success,
            errors: [],
          });
          observer.complete();
        },
        error: () => {
          observer.next({ success: 0, failed: dtos.length, errors: [] });
          observer.complete();
        },
      });
    });
  }
}
