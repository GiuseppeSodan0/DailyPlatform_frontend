import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { RoleService } from '../../core/services/role.service';
import { ToastService } from '../../core/services/toast.service';
import { Role } from '../../models/role.model';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmModal } from '../../shared/components/confirm-modal';
import { ModalWrapper } from '../../shared/components/modal-wrapper';
import { NoUnderscorePipe } from '../../shared/pipes/no-underscore';
import { RoleForm } from './role-form/role-form';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [AppLayout, RouterLink, HasPermissionDirective, ConfirmModal, ModalWrapper, NoUnderscorePipe, RoleForm],
  templateUrl: './roles.html',
})
export class Roles implements OnInit {
  private roleService = inject(RoleService);
  private toast = inject(ToastService);

  roles = signal<Role[]>([]);
  loading = signal(false);

  currentPage = signal(1);
  readonly pageSize = 15;

  pagedRoles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.roles().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.roles().length / this.pageSize)));

  modalMode: 'edit' | null = null;
  selectedRole: Role | null = null;

  deleteTarget: Role | null = null;

  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.loading.set(true);
    this.roleService.getAll().subscribe({
      next: (r) => { this.roles.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openEdit(role: Role): void {
    this.modalMode = 'edit';
    this.selectedRole = role;
  }

  closeModal(): void {
    this.modalMode = null;
    this.selectedRole = null;
  }

  onEditSaved(): void {
    this.closeModal();
    this.loadRoles();
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
