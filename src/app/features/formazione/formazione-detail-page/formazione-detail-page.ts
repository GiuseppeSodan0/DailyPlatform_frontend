import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { FormazioneService } from '../../../core/services/formazione.service';
import { Formazione } from '../../../models/formazione.model';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-formazione-detail-page',
  standalone: true,
  imports: [AppLayout, HasPermissionDirective],
  templateUrl: './formazione-detail-page.html',
})
export class FormazioneDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formazioneService = inject(FormazioneService);

  formazione = signal<Formazione | null>(null);
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
          return this.formazioneService.getById(id);
        }),
      )
      .subscribe({
        next: (formazione) => {
          this.formazione.set(formazione);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 404) {
            this.notFound.set(true);
          } else {
            this.error.set(err.error?.message || 'Errore nel caricamento della formazione');
          }
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/formazione']);
  }

  goEdit(): void {
    const f = this.formazione();
    if (!f) return;
    this.router.navigate(['/formazione', f.id, 'edit']);
  }

  statoLabel(stato: string | undefined): string {
    const labels: Record<string, string> = {
      PIANIFICATO: 'Pianificato',
      IN_CORSO: 'In corso',
      COMPLETATO: 'Completato',
      SCADUTO: 'Scaduto',
    };
    return stato ? labels[stato] || stato : '-';
  }

  isActive(status: string | undefined): boolean {
    return status === 'ACTIVE';
  }

  statusLabel(status: string | undefined): string {
    return status === 'ACTIVE' ? 'Attivo' : 'Inattivo';
  }
}
