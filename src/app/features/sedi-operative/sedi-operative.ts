import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { SedeOperativaService } from '../../core/services/sede-operativa.service';
import { CompanyService } from '../../core/services/company.service';
import { ToastService } from '../../core/services/toast.service';
import { Company } from '../../models/company.model';
import { SedeOperativa } from '../../models/sede-operativa.model';
import { ConfirmModal } from '../../shared/components/confirm-modal';
import { ModalWrapper } from '../../shared/components/modal-wrapper';
import { SedeOperativaForm } from './sede-operativa-form/sede-operativa-form';
import { NoUnderscorePipe } from '../../shared/pipes/no-underscore';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-sedi-operative',
  standalone: true,
  imports: [AppLayout, RouterLink, ConfirmModal, ModalWrapper, SedeOperativaForm, NoUnderscorePipe, FormsModule, HasPermissionDirective],
  templateUrl: './sedi-operative.html',
})
export class SediOperative implements OnInit {
  private sedeOperativaService = inject(SedeOperativaService);
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private toast = inject(ToastService);

  companies = signal<Company[]>([]);
  selectedCompanyId = signal<number | null>(null);
  sedi = signal<SedeOperativa[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  newSedeCompanyId = signal<number | null>(null);

  currentPage = signal(1);
  readonly pageSize = 15;

  pagedSedi = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.sedi().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.sedi().length / this.pageSize)));

  modalMode: 'edit' | null = null;
  selectedSede: SedeOperativa | null = null;
  deleteTarget = signal<SedeOperativa | null>(null);

  ngOnInit(): void {
    this.loadCompanies();
  }

  private loadCompanies(): void {
    this.companyService.getAll().subscribe({
      next: (c) => {
        this.companies.set(c);
        this.loadAllSedi();
      },
      error: (e) => {
        this.error.set(e.error?.message || `Errore caricamento aziende (${e.status})`);
        this.loading.set(false);
      },
    });
  }

  private loadAllSedi(): void {
    this.loading.set(true);
    this.error.set(null);
    this.sedeOperativaService.getAll().subscribe({
      next: (s) => { this.sedi.set(s); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message || `Errore caricamento (${e.status})`); this.loading.set(false); },
    });
  }

  onCompanyChange(companyId: number | null): void {
    this.selectedCompanyId.set(companyId);
    this.newSedeCompanyId.set(null);
    this.error.set(null);
    this.currentPage.set(1);
    if (companyId) {
      this.loadSedi(companyId);
    } else {
      this.loadAllSedi();
    }
  }

  private loadSedi(companyId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.sedeOperativaService.getByCompanyId(companyId).subscribe({
      next: (s) => { this.sedi.set(s.filter(item => item.companyId === companyId)); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message || `Errore caricamento (${e.status})`); this.loading.set(false); },
    });
  }

  viewSede(sede: SedeOperativa): void {
    const cid = this.selectedCompanyId() || sede.companyId;
    if (cid) this.router.navigate(['/sedi-operative', cid, sede.id]);
  }

  goToNewSede(): void {
    const cid = this.newSedeCompanyId();
    if (cid) this.router.navigate(['/sedi-operative', cid, 'new']);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openEdit(sede: SedeOperativa): void {
    this.modalMode = 'edit';
    this.selectedSede = sede;
  }

  closeModal(): void {
    this.modalMode = null;
    this.selectedSede = null;
  }

  onSaved(): void {
    this.closeModal();
    const cid = this.selectedCompanyId();
    if (cid) {
      this.loadSedi(cid);
    } else {
      this.loadAllSedi();
    }
  }

  confirmDelete(sede: SedeOperativa): void {
    this.deleteTarget.set(sede);
  }

  executeDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    const cid = this.selectedCompanyId() || target.companyId;
    if (!cid) return;
    this.sedeOperativaService.delete(cid, target.id).subscribe({
      next: () => {
        this.toast.success('Sede operativa eliminata');
        this.deleteTarget.set(null);
        if (this.selectedCompanyId()) {
          this.loadSedi(this.selectedCompanyId()!);
        } else {
          this.loadAllSedi();
        }
      },
      error: (e) => { this.toast.error(e.error?.message || `Errore eliminazione (${e.status})`); this.deleteTarget.set(null); },
    });
  }
}
