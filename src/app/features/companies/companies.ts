import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { CompanyService } from '../../core/services/company.service';
import { ToastService } from '../../core/services/toast.service';
import { Company } from '../../models/company.model';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmModal } from '../../shared/components/confirm-modal';
import { ModalWrapper } from '../../shared/components/modal-wrapper';
import { CompanyForm } from './company-form/company-form';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [AppLayout, RouterLink, HasPermissionDirective, ConfirmModal, ModalWrapper, CompanyForm],
  templateUrl: './companies.html',
})
export class Companies implements OnInit {
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private toast = inject(ToastService);

  companies = signal<Company[]>([]);
  loading = signal(false);

  currentPage = signal(1);
  readonly pageSize = 15;

  pagedCompanies = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.companies().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.companies().length / this.pageSize)));

  modalMode: 'edit' | null = null;
  selectedCompany: Company | null = null;
  deleteTarget: Company | null = null;

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

  openEdit(company: Company): void {
    this.modalMode = 'edit';
    this.selectedCompany = company;
  }

  closeModal(): void {
    this.modalMode = null;
    this.selectedCompany = null;
  }

  onSaved(): void {
    this.closeModal();
    this.loadCompanies();
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
