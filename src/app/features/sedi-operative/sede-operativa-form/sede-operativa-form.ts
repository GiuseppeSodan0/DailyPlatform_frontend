import { Component, signal, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SedeOperativaService, CreateSedeOperativaRequest, UpdateSedeOperativaRequest } from '../../../core/services/sede-operativa.service';
import { ToastService } from '../../../core/services/toast.service';
import { SedeOperativa } from '../../../models/sede-operativa.model';
import { Reparto } from '../../../models/reparto.enum';
import { NoUnderscorePipe } from '../../../shared/pipes/no-underscore';

@Component({
  selector: 'app-sede-operativa-form',
  standalone: true,
  imports: [ReactiveFormsModule, NoUnderscorePipe],
  templateUrl: './sede-operativa-form.html',
})
export class SedeOperativaForm implements OnInit {
  private sedeOperativaService = inject(SedeOperativaService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  mode = input.required<'create' | 'edit'>();
  companyId = input.required<number>();
  sede = input<SedeOperativa | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  saving = signal(false);
  repartiOptions = Object.values(Reparto);

  form = this.fb.group({
    nomeSede: ['', Validators.required],
    indirizzo: ['', Validators.required],
    civico: [null as number | null, Validators.required],
    responsabileSede: ['', Validators.required],
    reparti: [null as Reparto | null, Validators.required],
    cap: [null as number | null, Validators.required],
    comune: ['', Validators.required],
    provincia: ['', Validators.required],
    regione: ['', Validators.required],
    nazione: ['', Validators.required],
  });

  ngOnInit(): void {
    const source = this.mode() === 'edit' ? this.sede() : null;
    if (source) {
      this.form.patchValue(source as any);
    }
  }

  private buildPayload(): any {
    const raw = this.form.value;
    const data: any = {};
    Object.keys(raw).forEach((key) => {
      const val = (raw as any)[key];
      if (val !== null && val !== undefined && val !== '') data[key] = val;
    });
    return data;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    if (this.mode() === 'create') {
      this.sedeOperativaService.create(this.companyId(), this.buildPayload() as CreateSedeOperativaRequest).subscribe({
        next: () => { this.toast.success('Sede operativa creata'); this.saving.set(false); this.saved.emit(); },
        error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore creazione'); this.saving.set(false); },
      });
    } else if (this.mode() === 'edit' && this.sede()) {
      const data: UpdateSedeOperativaRequest = this.buildPayload();
      this.sedeOperativaService.update(this.companyId(), this.sede()!.id, data).subscribe({
        next: () => { this.toast.success('Sede operativa aggiornata'); this.saving.set(false); this.saved.emit(); },
        error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore aggiornamento'); this.saving.set(false); },
      });
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
