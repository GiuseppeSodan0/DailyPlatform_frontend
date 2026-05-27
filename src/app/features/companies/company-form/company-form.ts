import { Component, signal, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CompanyService, CreateCompanyRequest, UpdateCompanyRequest } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { Company } from '../../../models/company.model';
import { SelectItem, AppSelect } from '../../../shared/components/select';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [ReactiveFormsModule, AppSelect],
  templateUrl: './company-form.html',
})
export class CompanyForm implements OnInit {
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  mode = input.required<'create' | 'edit'>();
  company = input<Company | null>(null);
  saved = output<number>();
  cancelled = output<void>();

  saving = signal(false);

  form = this.fb.group({
    factoryName: [''],
    partitaIva: [null as number | null],
    email: [''],
    pec: [''],
    telefono: [''],
    responsabile: [null as number | null],
    indirizzo: [''],
    civico: [null as number | null],
    settore: [''],
    medicoCompetente: [null as number | null],
    rspp: [null as number | null],
    consulente: [null as number | null],
    cap: [''],
    comune: [''],
    provincia: [''],
    regione: [''],
    nazione: [''],
    codiceAteco: [''],
    numDipendenti: [null as number | null],
    codiceFiscale: [''],
    codiceUnivoco: [''],
    note: [''],
    adminEmail: [''],
    adminPassword: [''],
    adminName: [''],
    adminSurname: [''],
  });

  responsabileUsers = signal<SelectItem[]>([]);
  medicoCompetenteUsers = signal<SelectItem[]>([]);
  rsppUsers = signal<SelectItem[]>([]);
  consulenteUsers = signal<SelectItem[]>([]);

  ngOnInit(): void {
    const source = this.mode() === 'edit' ? this.company() : null;
    if (source) {
      this.form.patchValue({
        factoryName: source.factoryName,
        partitaIva: source.partitaIva,
        email: source.email,
        pec: source.pec,
        telefono: source.telefono,
        responsabile: source.responsabile?.id ?? null,
        indirizzo: source.indirizzo,
        civico: source.civico,
        settore: source.settore,
        medicoCompetente: source.medicoCompetente?.id ?? null,
        rspp: source.rspp?.id ?? null,
        consulente: source.consulente?.id ?? null,
        cap: source.cap,
        comune: source.comune,
        provincia: source.provincia,
        regione: source.regione,
        nazione: source.nazione,
        codiceAteco: source.codiceAteco,
        numDipendenti: source.numDipendenti,
        codiceFiscale: source.codiceFiscale,
        codiceUnivoco: source.codiceUnivoco,
        note: source.note,
      });
    }

    if (this.mode() === 'edit') {
      this.loadUsersByRole();
    }
  }

  private loadUsersByRole(): void {
    const companyId = this.company()!.id;
    this.userService.getByRole('RESPONSABILE').subscribe(users => {
      this.responsabileUsers.set(users.filter(u => u.companyId === companyId).map(u => ({ id: u.id, name: u.name + ' ' + u.surname })));
    });
    this.userService.getByRole('MEDICO_COMPETENTE').subscribe(users => {
      this.medicoCompetenteUsers.set(users.filter(u => u.companyId === companyId).map(u => ({ id: u.id, name: u.name + ' ' + u.surname })));
    });
    this.userService.getByRole('RSPP').subscribe(users => {
      this.rsppUsers.set(users.filter(u => u.companyId === companyId).map(u => ({ id: u.id, name: u.name + ' ' + u.surname })));
    });
    this.userService.getByRole('CONSULENTE').subscribe(users => {
      this.consulenteUsers.set(users.filter(u => u.companyId === companyId).map(u => ({ id: u.id, name: u.name + ' ' + u.surname })));
    });
  }

  private buildPayload(): any {
    const raw = this.form.value;
    const base: any = {};
    Object.keys(raw).forEach((key) => {
      const val = (raw as any)[key];
      if (val !== null && val !== undefined && val !== '') base[key] = val;
    });
    return base;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const payload = this.buildPayload();

    if (this.mode() === 'create') {
      this.companyService.create(payload as CreateCompanyRequest).subscribe({
        next: (company) => { this.toast.success('Azienda creata'); this.saving.set(false); this.saved.emit(company.id); },
        error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore creazione'); this.saving.set(false); },
      });
    } else if (this.mode() === 'edit' && this.company()) {
      this.companyService.update(this.company()!.id, payload as UpdateCompanyRequest).subscribe({
        next: () => { this.toast.success('Azienda aggiornata'); this.saving.set(false); this.saved.emit(this.company()!.id); },
        error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore aggiornamento'); this.saving.set(false); },
      });
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
