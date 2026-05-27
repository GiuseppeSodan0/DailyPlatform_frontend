import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { FormazioneService } from '../../../core/services/formazione.service';
import { Formazione } from '../../../models/formazione.model';
import { FormazioneForm } from '../formazione-form/formazione-form';

@Component({
  selector: 'app-formazione-edit-page',
  standalone: true,
  imports: [AppLayout, FormazioneForm],
  templateUrl: './formazione-edit-page.html',
})
export class FormazioneEditPage implements OnInit {
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

  onSaved(): void {
    this.router.navigate(['/formazione']);
  }

  onCancelled(): void {
    this.router.navigate(['/formazione']);
  }

  goBack(): void {
    this.router.navigate(['/formazione']);
  }
}
