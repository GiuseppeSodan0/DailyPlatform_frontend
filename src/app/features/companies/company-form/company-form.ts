import { Component, signal, computed, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CompanyService, CreateCompanyRequest, UpdateCompanyRequest } from '../../../core/services/company.service';
import { ToastService } from '../../../core/services/toast.service';
import { Company } from '../../../models/company.model';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './company-form.html',
})
export class CompanyForm implements OnInit {
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  mode = input.required<'create' | 'edit'>();
  company = input<Company | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  saving = signal(false);

  form = this.fb.group({
    factoryName: [''],
    partitaIva: [null as number | null],
    email: [''],
    pec: [''],
    telefono: [''],
    responsabile: [''],
    sedeOperativa: [''],
    indirizzo: [''],
    civico: [null as number | null],
    settore: [''],
    medicoCompetente: [''],
    rspp: [''],
    consulente: [''],
    cap: [''],
    comune: [''],
    provincia: [''],
    regione: [''],
    nazione: [''],
    codiceAteco: [''],
    numDipendenti: [null as number | null],
    codiceFiscale: [''],
    codiceUnivoco: [''],
    uid: [''],
    uuid: [''],
    note: [''],
  });

  ngOnInit(): void {
    const source = this.mode() === 'edit' ? this.company() : null;
    if (source) {
      this.form.patchValue(source as any);
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const raw = this.form.value;

    if (this.mode() === 'create') {
      this.companyService.create(raw as CreateCompanyRequest).subscribe({
        next: () => { this.toast.success('Azienda creata'); this.saving.set(false); this.saved.emit(); },
        error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore creazione'); this.saving.set(false); },
      });
    } else if (this.mode() === 'edit' && this.company()) {
      const data: UpdateCompanyRequest = {};
      Object.keys(raw).forEach((key) => {
        if (key === 'uid' || key === 'uuid') return;
        const val = (raw as any)[key];
        if (val !== null && val !== undefined && val !== '') (data as any)[key] = val;
      });
      this.companyService.update(this.company()!.id, data).subscribe({
        next: () => { this.toast.success('Azienda aggiornata'); this.saving.set(false); this.saved.emit(); },
        error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore aggiornamento'); this.saving.set(false); },
      });
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
