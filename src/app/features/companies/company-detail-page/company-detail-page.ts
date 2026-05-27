import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { Company } from '../../../models/company.model';
import { User } from '../../../models/user.model';
import { SedeOperativa } from '../../../models/sede-operativa.model';
import { ModalWrapper } from '../../../shared/components/modal-wrapper';
import { CompanyForm } from '../company-form/company-form';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-company-detail-page',
  standalone: true,
  imports: [AppLayout, ModalWrapper, CompanyForm, HasPermissionDirective],
  templateUrl: './company-detail-page.html',
})
export class CompanyDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  company = signal<Company | null>(null);
  workers = signal<User[]>([]);
  workersLoading = signal(false);
  loading = signal(true);
  error = signal<string | null>(null);
  notFound = signal(false);

  modalMode: 'edit' | null = null;
  private currentUuid: string | null = null;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const uuid = params.get('uuid')!;
          this.currentUuid = uuid;
          this.loading.set(true);
          this.error.set(null);
          this.notFound.set(false);
          return this.companyService.getByUuid(uuid);
        }),
      )
      .subscribe({
        next: (company) => {
          this.company.set(company);
          this.loading.set(false);
          this.loadWorkers(company.id);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 404) {
            this.notFound.set(true);
          } else {
            this.error.set(err.error?.message || "Errore nel caricamento dell'azienda");
          }
        },
      });
  }

  private reload(): void {
    if (!this.currentUuid) return;
    this.companyService.getByUuid(this.currentUuid).subscribe({
      next: (company) => this.company.set(company),
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
    this.reload();
  }

  private loadWorkers(companyId: number): void {
    this.workersLoading.set(true);
    this.userService.getAll().subscribe({
      next: (users) => {
        this.workers.set(users.filter((u) => u.companyId === companyId));
        this.workersLoading.set(false);
      },
      error: () => {
        this.workersLoading.set(false);
        this.toast.error("Errore nel caricamento dei lavoratori");
      },
    });
  }

  statusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Attivo' : 'Inattivo';
  }

  viewSede(sede: SedeOperativa, companyId: number): void {
    this.router.navigate(['/sedi-operative', companyId, sede.id]);
  }

  viewWorker(worker: User): void {
    this.router.navigate(['/users', worker.id]);
  }

  goBack(): void {
    this.router.navigate(['/companies']);
  }

  isActive(status: string): boolean {
    return status === 'ACTIVE';
  }
}
