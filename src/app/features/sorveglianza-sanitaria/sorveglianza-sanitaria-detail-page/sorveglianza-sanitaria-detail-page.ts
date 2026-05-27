import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { SorveglianzaSanitariaService } from '../../../core/services/sorveglianza-sanitaria.service';
import { SorveglianzaSanitaria } from '../../../models/sorveglianza-sanitaria.model';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-sorveglianza-sanitaria-detail-page',
  standalone: true,
  imports: [AppLayout, HasPermissionDirective],
  templateUrl: './sorveglianza-sanitaria-detail-page.html',
})
export class SorveglianzaSanitariaDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sorveglianzaSanitariaService = inject(SorveglianzaSanitariaService);

  sorveglianzaSanitaria = signal<SorveglianzaSanitaria | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  notFound = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = Number(params.get('id'));
          this.loading.set(true);
          this.error.set(null);
          this.notFound.set(false);
          return this.sorveglianzaSanitariaService.getById(id);
        }),
      )
      .subscribe({
        next: (s) => {
          this.sorveglianzaSanitaria.set(s);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 404) {
            this.notFound.set(true);
          } else {
            this.error.set(err.error?.message || 'Errore nel caricamento della sorveglianza sanitaria');
          }
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/sorveglianza-sanitaria']);
  }

  goEdit(): void {
    const s = this.sorveglianzaSanitaria();
    if (!s) return;
    this.router.navigate(['/sorveglianza-sanitaria', s.id, 'edit']);
  }

  giudizioLabel(giudizio: string | undefined): string {
    const labels: Record<string, string> = {
      IDONEO: 'Idoneo',
      IDONEO_CON_PRESCRIZIONI: 'Idoneo con prescrizioni',
      INIDONEO: 'Inidoneo',
      DA_VERIFICARE: 'Da verificare',
    };
    return giudizio ? labels[giudizio] || giudizio : '-';
  }

  isActive(status: string | undefined): boolean {
    return status === 'ACTIVE';
  }

  statusLabel(status: string | undefined): string {
    return status === 'ACTIVE' ? 'Attivo' : 'Inattivo';
  }
}
