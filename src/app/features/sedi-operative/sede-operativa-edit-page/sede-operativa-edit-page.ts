import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { SedeOperativaService } from '../../../core/services/sede-operativa.service';
import { SedeOperativa } from '../../../models/sede-operativa.model';
import { SedeOperativaForm } from '../sede-operativa-form/sede-operativa-form';

@Component({
  selector: 'app-sede-operativa-edit-page',
  standalone: true,
  imports: [AppLayout, SedeOperativaForm],
  templateUrl: './sede-operativa-edit-page.html',
})
export class SedeOperativaEditPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sedeOperativaService = inject(SedeOperativaService);

  companyId = 0;
  sede = signal<SedeOperativa | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  notFound = signal(false);

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

  onSaved(): void {
    this.router.navigate(['/sedi-operative']);
  }

  onCancelled(): void {
    this.router.navigate(['/sedi-operative']);
  }

  goBack(): void {
    this.router.navigate(['/sedi-operative']);
  }
}
