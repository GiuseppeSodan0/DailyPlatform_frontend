import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { PolicyService, CreatePolicyRequest } from '../../core/services/policy.service';
import { ToastService } from '../../core/services/toast.service';
import { Policy } from '../../models/policy.model';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmModal } from '../../shared/components/confirm-modal';
import { ModalWrapper } from '../../shared/components/modal-wrapper';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [AppLayout, HasPermissionDirective, ConfirmModal, ModalWrapper, ReactiveFormsModule],
  templateUrl: './policies.html',
})
export class Policies implements OnInit {
  private router = inject(Router);
  private policyService = inject(PolicyService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  policies = signal<Policy[]>([]);
  loading = signal(false);
  saving = signal(false);

  modalMode: 'create' | 'edit' | null = null;
  selectedPolicy: Policy | null = null;
  deleteTarget: Policy | null = null;

  policyForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    expression: ['', Validators.required],
    targetEntity: [''],
    targetAction: [''],
    priority: [0],
    companyId: [null as number | null],
  });

  currentPage = signal(1);
  pageSize = 15;

  pagedPolicies = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.policies().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.policies().length / this.pageSize)));

  ngOnInit(): void {
    this.loadPolicies();
  }

  private loadPolicies(): void {
    this.loading.set(true);
    this.policyService.getAll().subscribe({
      next: (p) => { this.policies.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  openCreate(): void {
    this.modalMode = 'create';
    this.selectedPolicy = null;
    this.policyForm.reset({ priority: 0, companyId: null });
  }

  openEdit(policy: Policy): void {
    this.modalMode = 'edit';
    this.selectedPolicy = policy;
    this.policyForm.patchValue({
      name: policy.name,
      description: policy.description || '',
      expression: policy.expression,
      targetEntity: policy.targetEntity || '',
      targetAction: policy.targetAction || '',
      priority: policy.priority || 0,
      companyId: policy.companyId ?? null,
    });
  }

  closeModal(): void {
    this.modalMode = null;
    this.selectedPolicy = null;
  }

  save(): void {
    if (this.policyForm.invalid) return;
    this.saving.set(true);

    const formValue = this.policyForm.value;
    const data: CreatePolicyRequest = {
      name: formValue.name!,
      description: formValue.description || undefined,
      expression: formValue.expression!,
      targetEntity: formValue.targetEntity || undefined,
      targetAction: formValue.targetAction || undefined,
      priority: formValue.priority ?? 0,
      companyId: formValue.companyId ?? undefined,
    };

    const request$ = this.modalMode === 'edit' && this.selectedPolicy
      ? this.policyService.update(this.selectedPolicy.id, data)
      : this.policyService.create(data);

    request$.subscribe({
      next: () => {
        this.toast.success(this.modalMode === 'create' ? 'Policy creata' : 'Policy aggiornata');
        this.closeModal();
        this.loadPolicies();
        this.saving.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.toast.error(e.error?.message || 'Errore');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(policy: Policy): void {
    this.deleteTarget = policy;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    this.policyService.delete(this.deleteTarget.id).subscribe({
      next: () => { this.toast.success('Policy eliminata'); this.deleteTarget = null; this.loadPolicies(); },
      error: (e) => { this.toast.error(e.error?.message || 'Errore eliminazione'); this.deleteTarget = null; },
    });
  }

  isActive(status: string): boolean {
    return status === 'ACTIVE';
  }
}
