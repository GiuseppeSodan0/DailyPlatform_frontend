import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { SedeOperativaService } from '../../../core/services/sede-operativa.service';
import { UserService } from '../../../core/services/user.service';
import { SedeOperativa } from '../../../models/sede-operativa.model';
import { User } from '../../../models/user.model';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-sede-operativa-detail-page',
  standalone: true,
  imports: [AppLayout, HasPermissionDirective],
  templateUrl: './sede-operativa-detail-page.html',
})
export class SedeOperativaDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sedeOperativaService = inject(SedeOperativaService);
  private userService = inject(UserService);

  companyId = 0;
  sede = signal<SedeOperativa | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  notFound = signal(false);

  lavoratori = signal<User[]>([]);
  loadingLavoratori = signal(true);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const companyId = Number(params.get('companyId'));
          const id = Number(params.get('id'));
          this.companyId = companyId;
          this.loading.set(true);
          this.error.set(null);
          this.notFound.set(false);
          return this.sedeOperativaService.getById(companyId, id);
        }),
      )
      .subscribe({
        next: (sede) => {
          this.sede.set(sede);
          this.loading.set(false);
          this.loadLavoratori(sede.id);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 404) {
            this.notFound.set(true);
          } else {
            this.error.set(err.error?.message || "Errore nel caricamento della sede operativa");
          }
        },
      });
  }

  private loadLavoratori(sedeId: number): void {
    this.loadingLavoratori.set(true);
    this.userService.getBySedeOperativaId(sedeId).subscribe({
      next: (lavoratori) => {
        this.lavoratori.set(lavoratori);
        this.loadingLavoratori.set(false);
      },
      error: () => {
        this.lavoratori.set([]);
        this.loadingLavoratori.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/sedi-operative']);
  }

  goEdit(): void {
    const sede = this.sede();
    if (!sede) return;
    this.router.navigate(['/sedi-operative', this.companyId, sede.id, 'edit']);
  }

  isActive(status: string): boolean {
    return status === 'ACTIVE';
  }

  statusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Attivo' : 'Inattivo';
  }
}
