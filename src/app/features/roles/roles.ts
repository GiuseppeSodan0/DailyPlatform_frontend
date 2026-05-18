import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { RoleService, CreateRoleRequest, UpdateRoleRequest } from '../../core/services/role.service';
import { CompanyService } from '../../core/services/company.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Role } from '../../models/role.model';
import { Company } from '../../models/company.model';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmModal } from '../../shared/components/confirm-modal';
import { ModalWrapper } from '../../shared/components/modal-wrapper';
import { NoUnderscorePipe } from '../../shared/pipes/no-underscore';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [AppLayout, ReactiveFormsModule, HasPermissionDirective, ConfirmModal, ModalWrapper, NoUnderscorePipe],
  templateUrl: './roles.html',
})
export class Roles implements OnInit {
  private router = inject(Router);
  private roleService = inject(RoleService);
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  roles = signal<Role[]>([]);
  companies = signal<Company[]>([]);
  loading = signal(false);
  activeTab: 'all' | 'global' | 'tenant' = 'all';

  filteredRoles = computed(() => {
    if (this.activeTab === 'all') return this.roles();
    return this.roles().filter(r => r.scope === this.activeTab.toUpperCase());
  });

  private readonly SYSTEM_ROLE_NAMES = ['super admin', 'admin', 'user'];

  isSystemAdmin = computed(() =>
    this.authService.roles().some(r => {
      const normalized = r.toLowerCase().trim().replace(/_/g, ' ');
      return this.SYSTEM_ROLE_NAMES.includes(normalized);
    })
  );

  modalMode: 'create' | 'edit' | null = null;
  selectedRole: Role | null = null;
  saving = signal(false);

  deleteTarget: Role | null = null;

  roleForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    scope: ['GLOBAL'],
    companyId: [null as number | null],
  });

  ngOnInit(): void {
    this.loadRoles();
    this.loadCompanies();
  }

  private loadRoles(): void {
    this.loading.set(true);
    this.roleService.getAll().subscribe({
      next: (r) => { this.roles.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private loadCompanies(): void {
    this.companyService.getAll().subscribe({
      next: (c) => this.companies.set(c),
    });
  }

  setActiveTab(tab: 'all' | 'global' | 'tenant'): void {
    this.activeTab = tab;
  }

  openCreate(): void {
    this.modalMode = 'create';
    this.selectedRole = null;
    const defaultScope = this.isSystemAdmin() ? 'GLOBAL' : 'TENANT';
    this.roleForm.reset({ name: '', description: '', scope: defaultScope, companyId: null });
  }

  openEdit(role: Role): void {
    this.modalMode = 'edit';
    this.selectedRole = role;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description || '',
      scope: role.scope,
      companyId: role.companyId ?? null,
    });
  }

  openPermissions(role: Role): void {
    this.router.navigate(['/roles', role.id, 'permissions']);
  }

  closeModal(): void {
    this.modalMode = null;
    this.selectedRole = null;
  }

  saveRole(): void {
    if (this.roleForm.invalid) return;
    this.saving.set(true);

    if (this.modalMode === 'create') {
      const formValue = this.roleForm.value;
      const data: CreateRoleRequest = {
        name: formValue.name!,
        description: formValue.description || undefined,
      };
      if (formValue.scope === 'TENANT' && formValue.companyId) {
        data.companyId = formValue.companyId;
      }
      this.roleService.create(data).subscribe({
        next: () => { this.toast.success('Ruolo creato'); this.closeModal(); this.loadRoles(); this.saving.set(false); },
        error: (e) => { this.toast.error(e.error?.message || 'Errore creazione'); this.saving.set(false); },
      });
    } else if (this.modalMode === 'edit' && this.selectedRole) {
      const formValue = this.roleForm.value;
      const data: UpdateRoleRequest = {};
      if (formValue.name) data.name = formValue.name;
      if (formValue.description) data.description = formValue.description;
      this.roleService.update(this.selectedRole.id, data).subscribe({
        next: () => { this.toast.success('Ruolo aggiornato'); this.closeModal(); this.loadRoles(); this.saving.set(false); },
        error: (e) => { this.toast.error(e.error?.message || 'Errore aggiornamento'); this.saving.set(false); },
      });
    }
  }

  confirmDelete(role: Role): void {
    this.deleteTarget = role;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    this.roleService.delete(this.deleteTarget.id).subscribe({
      next: () => { this.toast.success('Ruolo eliminato'); this.deleteTarget = null; this.loadRoles(); },
      error: (e) => { this.toast.error(e.error?.message || 'Errore eliminazione'); this.deleteTarget = null; },
    });
  }

  isActive(status: string): boolean {
    return status === 'ACTIVE';
  }

  toggleStatus(role: Role): void {
    if (role.systemRole) return;
    const newStatus = role.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.roleService.update(role.id, { status: newStatus }).subscribe({
      next: () => {
        this.toast.success(newStatus === 'ACTIVE' ? 'Ruolo attivato' : 'Ruolo disattivato');
        this.loadRoles();
      },
      error: (e) => this.toast.error(e.error?.message || 'Errore aggiornamento stato'),
    });
  }
}
