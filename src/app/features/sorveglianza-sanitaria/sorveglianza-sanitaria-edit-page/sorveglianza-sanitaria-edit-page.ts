import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { SorveglianzaSanitariaService } from '../../../core/services/sorveglianza-sanitaria.service';
import { SorveglianzaSanitaria } from '../../../models/sorveglianza-sanitaria.model';
import { SorveglianzaSanitariaForm } from '../sorveglianza-sanitaria-form/sorveglianza-sanitaria-form';

@Component({
  selector: 'app-sorveglianza-sanitaria-edit-page',
  standalone: true,
  imports: [AppLayout, SorveglianzaSanitariaForm],
  templateUrl: './sorveglianza-sanitaria-edit-page.html',
})
export class SorveglianzaSanitariaEditPage implements OnInit {
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

  onSaved(): void {
    this.router.navigate(['/sorveglianza-sanitaria']);
  }

  onCancelled(): void {
    this.router.navigate(['/sorveglianza-sanitaria']);
  }

  goBack(): void {
    this.router.navigate(['/sorveglianza-sanitaria']);
  }
}
