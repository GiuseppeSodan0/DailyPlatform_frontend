import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { AuthService } from '../../core/services/auth.service';
import { CompanyService } from '../../core/services/company.service';
import { ToastService } from '../../core/services/toast.service';
import { Company } from '../../models/company.model';
import { ModalWrapper } from '../../shared/components/modal-wrapper';
import { CompanyForm } from '../companies/company-form/company-form';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [AppLayout, ModalWrapper, CompanyForm],
  templateUrl: './company-settings.html',
})
export class CompanySettingsPage implements OnInit {
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private toast = inject(ToastService);

  company = signal<Company | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  noCompany = signal(false);

  modalMode: 'edit' | null = null;

  ngOnInit(): void {
    const companyId = this.authService.user()?.companyId;
    if (!companyId) {
      this.noCompany.set(true);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.companyService.getById(companyId).subscribe({
      next: (company) => {
        this.company.set(company);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.message || "Errore nel caricamento dell'azienda");
      },
    });
  }

  openEdit(): void {
    this.modalMode = 'edit';
  }

  closeModal(): void {
    this.modalMode = null;
  }

  onSaved(): void {
    this.closeModal();
    const companyId = this.authService.user()?.companyId;
    if (!companyId) return;
    this.companyService.getById(companyId).subscribe({
      next: (company) => this.company.set(company),
      error: () => this.toast.error("Errore nel ricaricare i dati dell'azienda"),
    });
  }
}
