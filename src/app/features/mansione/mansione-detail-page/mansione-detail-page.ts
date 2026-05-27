import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { MansioneService } from '../../../core/services/mansione.service';
import { Mansione } from '../../../models/mansione.model';
import { NoUnderscorePipe } from '../../../shared/pipes/no-underscore';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-mansione-detail-page',
  standalone: true,
  imports: [AppLayout, NoUnderscorePipe, HasPermissionDirective],
  templateUrl: './mansione-detail-page.html',
})
export class MansioneDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mansioneService = inject(MansioneService);

  mansione = signal<Mansione | null>(null);
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
          return this.mansioneService.getById(id);
        }),
      )
      .subscribe({
        next: (mansione) => {
          this.mansione.set(mansione);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 404) {
            this.notFound.set(true);
          } else {
            this.error.set(err.error?.message || 'Errore nel caricamento della mansione');
          }
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/mansione']);
  }

  goEdit(): void {
    const mansione = this.mansione();
    if (!mansione) return;
    this.router.navigate(['/mansione', mansione.id, 'edit']);
  }

  isActive(status: string | undefined): boolean {
    return status === 'ACTIVE';
  }

  statusLabel(status: string | undefined): string {
    return status === 'ACTIVE' ? 'Attivo' : 'Inattivo';
  }
}
