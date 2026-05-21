import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { CompanyService, CreateCompanyRequest, UpdateCompanyRequest } from '../../core/services/company.service';
import { ToastService } from '../../core/services/toast.service';
import { Company } from '../../models/company.model';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmModal } from '../../shared/components/confirm-modal';
import { ModalWrapper } from '../../shared/components/modal-wrapper';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [AppLayout, ReactiveFormsModule, HasPermissionDirective, ConfirmModal, ModalWrapper],
  templateUrl: './companies.html',
})
export class Companies implements OnInit {
  private companyService = inject(CompanyService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  companies = signal<Company[]>([]);
  loading = signal(false);

  currentPage = signal(1);
  readonly pageSize = 15;

  pagedCompanies = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.companies().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.companies().length / this.pageSize)));

  modalMode: 'create' | 'edit' | null = null;
  selectedCompany: Company | null = null;
  saving = signal(false);
  deleteTarget: Company | null = null;

  form = this.fb.group({
    factoryName: [''],
    partitaIva: [null as number | null],
    email: [''],
    telefono: [''],
    responsabile: [''],
    cap: [''],
    comune: [''],
    provincia: [''],
    regione: [''],
    nazione: [''],
    codiceAteco: [''],
    numDipendenti: [null as number | null],
    pec: [''],
    note: [''],
    uid: [''],
    uuid: [''],
    codiceFiscale: [''],
    codiceUnivoco: [''],
  });

  ngOnInit(): void {
    this.loadCompanies();
  }

  private loadCompanies(): void {
    this.loading.set(true);
    this.companyService.getAll().subscribe({
      next: (c) => { this.companies.set(c); this.currentPage.set(1); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openCreate(): void {
    this.modalMode = 'create';
    this.selectedCompany = null;
    this.form.reset();
  }

  openEdit(company: Company): void {
    this.modalMode = 'edit';
    this.selectedCompany = company;
    this.form.patchValue(company as any);
  }

  closeModal(): void {
    this.modalMode = null;
    this.selectedCompany = null;
  }

  saveCompany(): void {
    this.saving.set(true);
    const raw = this.form.value;

    if (this.modalMode === 'create') {
      this.companyService.create(raw as CreateCompanyRequest).subscribe({
        next: () => { this.toast.success('Azienda creata'); this.closeModal(); this.loadCompanies(); this.saving.set(false); },
        error: (e) => { this.toast.error(e.error?.message || 'Errore creazione'); this.saving.set(false); },
      });
    } else if (this.modalMode === 'edit' && this.selectedCompany) {
      const data: UpdateCompanyRequest = {};
      Object.keys(raw).forEach((key) => {
        if (key === 'uid' || key === 'uuid') return;
        const val = (raw as any)[key];
        if (val !== null && val !== undefined && val !== '') (data as any)[key] = val;
      });
      this.companyService.update(this.selectedCompany.id, data).subscribe({
        next: () => { this.toast.success('Azienda aggiornata'); this.closeModal(); this.loadCompanies(); this.saving.set(false); },
        error: (e) => { this.toast.error(e.error?.message || 'Errore aggiornamento'); this.saving.set(false); },
      });
    }
  }

  confirmDelete(company: Company): void {
    this.deleteTarget = company;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    this.companyService.delete(this.deleteTarget.id).subscribe({
      next: () => { this.toast.success('Azienda eliminata'); this.deleteTarget = null; this.loadCompanies(); },
      error: (e) => { this.toast.error(e.error?.message || 'Errore eliminazione'); this.deleteTarget = null; },
    });
  }

  isActive(status: string): boolean {
    return status === 'ACTIVE';
  }
}
