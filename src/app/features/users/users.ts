import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { UserService, CreateUserRequest, UpdateUserRequest } from '../../core/services/user.service';
import { UserImportExportService } from '../../core/services/user-import-export.service';
import { CompanyService } from '../../core/services/company.service';
import { RoleService } from '../../core/services/role.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../models/user.model';
import { Company } from '../../models/company.model';
import { Role } from '../../models/role.model';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmModal } from '../../shared/components/confirm-modal';
import { ModalWrapper } from '../../shared/components/modal-wrapper';
import { NoUnderscorePipe } from '../../shared/pipes/no-underscore';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [AppLayout, ReactiveFormsModule, FormsModule, HasPermissionDirective, ConfirmModal, ModalWrapper, NoUnderscorePipe],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  private userService = inject(UserService);
  private importExportService = inject(UserImportExportService);
  private companyService = inject(CompanyService);
  private roleService = inject(RoleService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  allRoles = signal<Role[]>([]);
  allCompanies = signal<Company[]>([]);

  searchInput = '';
  searchQuery = signal('');
  statusFilter = signal('');
  companyFilter = signal<number | null>(null);

  loading = signal(false);
  loadingCompanies = signal(false);
  loadingRoles = signal(false);
  saving = signal(false);

  modalMode: 'create' | 'edit' | 'detail' | 'roles' | null = null;
  selectedUser: User | null = null;
  deleteTarget: User | null = null;

  currentPage = signal(1);
  pageSize = 10;

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    name: ['', Validators.required],
    surname: ['', Validators.required],
    status: ['ACTIVE', Validators.required],
    companyId: [null as number | null],
    roleIds: [[] as number[]],
  });

  roleAssignForm = this.fb.group({
    roleIds: [[] as number[]],
  });

  filteredUsers = computed(() => {
    let result = this.users();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.surname.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query),
      );
    }

    const statusVal = this.statusFilter();
    if (statusVal) {
      result = result.filter((u) => u.status === statusVal);
    }

    const companyVal = this.companyFilter();
    if (companyVal !== null) {
      result = result.filter((u) => u.companyId === companyVal);
    }

    return result;
  });

  pagedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize)));

  ngOnInit(): void {
    this.loadUsers();
    this.loadCompanies();
    this.loadRoles();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (u) => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private loadCompanies(): void {
    this.loadingCompanies.set(true);
    this.companyService.getAll().subscribe({
      next: (c) => { this.allCompanies.set(c); this.loadingCompanies.set(false); },
      error: () => this.loadingCompanies.set(false),
    });
  }

  private loadRoles(): void {
    this.loadingRoles.set(true);
    this.roleService.getAll().subscribe({
      next: (r) => { this.allRoles.set(r); this.loadingRoles.set(false); },
      error: () => this.loadingRoles.set(false),
    });
  }

  search(): void {
    this.searchQuery.set(this.searchInput);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchInput = '';
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  setCompanyFilter(companyId: string): void {
    this.companyFilter.set(companyId ? Number(companyId) : null);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getCompanyName(companyId: number | null | undefined): string {
    if (!companyId) return '-';
    const company = this.allCompanies().find((c) => c.id === companyId);
    return company?.factoryName || `ID ${companyId}`;
  }

  openDetail(user: User): void {
    this.selectedUser = user;
    this.modalMode = 'detail';
  }

  openCreate(): void {
    this.modalMode = 'create';
    this.selectedUser = null;
    this.userForm.reset({
      email: '',
      password: '',
      name: '',
      surname: '',
      status: 'ACTIVE',
      companyId: null,
      roleIds: [],
    });
    this.userForm.get('password')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
  }

  openEdit(user: User): void {
    this.modalMode = 'edit';
    this.selectedUser = user;
    const roleIds = this.allRoles()
      .filter((r) => user.roles.includes(r.name))
      .map((r) => r.id);
    this.userForm.patchValue({
      email: user.email,
      password: '',
      name: user.name,
      surname: user.surname,
      status: user.status,
      companyId: user.companyId,
      roleIds,
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValue('');
  }

  openRoles(user: User): void {
    this.modalMode = 'roles';
    this.selectedUser = user;
    this.roleAssignForm.setValue({
      roleIds: this.allRoles().filter((r) => user.roles.includes(r.name)).map((r) => r.id),
    });
  }

  closeModal(): void {
    this.modalMode = null;
    this.selectedUser = null;
  }

  saveUser(): void {
    if (this.userForm.invalid) return;
    this.saving.set(true);

    if (this.modalMode === 'create') {
      const data: CreateUserRequest = {
        email: this.userForm.value.email!,
        password: this.userForm.value.password!,
        name: this.userForm.value.name!,
        surname: this.userForm.value.surname!,
        status: this.userForm.value.status || undefined,
        companyId: this.userForm.value.companyId ?? undefined,
        roleIds: this.userForm.value.roleIds ?? undefined,
      };
      this.userService.create(data).subscribe({
        next: () => { this.toast.success('Utente creato con successo'); this.closeModal(); this.loadUsers(); this.saving.set(false); },
        error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore durante la creazione'); this.saving.set(false); },
      });
    } else if (this.modalMode === 'edit' && this.selectedUser) {
      const data: UpdateUserRequest = {};
      const raw = this.userForm.value;
      if (raw.email) data.email = raw.email;
      if (raw.name) data.name = raw.name;
      if (raw.surname) data.surname = raw.surname;
      if (raw.status) data.status = raw.status;
      if (raw.password) data.password = raw.password;
      if (raw.companyId !== null && raw.companyId !== undefined) data.companyId = raw.companyId;
      if (raw.roleIds) data.roleIds = raw.roleIds;
      this.userService.update(this.selectedUser.id, data).subscribe({
        next: () => { this.toast.success('Utente aggiornato con successo'); this.closeModal(); this.loadUsers(); this.saving.set(false); },
        error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore durante l\'aggiornamento'); this.saving.set(false); },
      });
    }
  }

  saveRoles(): void {
    if (!this.selectedUser) return;
    this.saving.set(true);
    const roleIds = this.roleAssignForm.value.roleIds ?? [];
    this.userService.addRoles(this.selectedUser.id, { roleIds }).subscribe({
      next: () => { this.toast.success('Ruoli assegnati con successo'); this.closeModal(); this.loadUsers(); this.saving.set(false); },
      error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore nell\'assegnazione ruoli'); this.saving.set(false); },
    });
  }

  confirmDelete(user: User): void {
    this.deleteTarget = user;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    this.userService.delete(this.deleteTarget.id).subscribe({
      next: () => { this.toast.success('Utente eliminato con successo'); this.deleteTarget = null; this.loadUsers(); },
      error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore durante l\'eliminazione'); this.deleteTarget = null; },
    });
  }

  toggleRoleInForm(roleId: number): void {
    const current = this.userForm.value.roleIds ?? [];
    const updated = current.includes(roleId)
      ? current.filter((id) => id !== roleId)
      : [...current, roleId];
    this.userForm.patchValue({ roleIds: updated });
  }

  toggleRoleInAssignForm(roleId: number): void {
    const current = this.roleAssignForm.value.roleIds ?? [];
    const updated = current.includes(roleId)
      ? current.filter((id) => id !== roleId)
      : [...current, roleId];
    this.roleAssignForm.setValue({ roleIds: updated });
  }

  importing = signal(false);

  exportUser(user: User): void {
    const dto = this.importExportService.toExportDto(user);
    const filename = `${user.name}_${user.surname}_${user.id}`.toLowerCase().replace(/\s+/g, '_');
    this.importExportService.exportToJson(dto, filename);
    this.toast.success(`Utente ${user.email} esportato`);
  }

  exportAll(): void {
    const list = this.filteredUsers().map(u => this.importExportService.toExportDto(u));
    const filename = `utenti_${new Date().toISOString().slice(0, 10)}`;
    this.importExportService.exportToJson(list, filename);
    this.toast.success(`${list.length} utenti esportati`);
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.importing.set(true);
    this.importExportService.parseFile(file).then(
      (dtos) => {
        const { valid, errors } = this.importExportService.validate(dtos);
        if (errors.length > 0) {
          const msgs = errors.map(e => `Riga ${e.row}: ${e.message}`).join('\n');
          this.toast.error(`Errori di validazione (${errors.length}):\n${msgs}`);
        }
        if (valid.length === 0) {
          this.importing.set(false);
          input.value = '';
          return;
        }
        this.importExportService.importUsers(valid).subscribe({
          next: (result) => {
            const msg = `Importati ${result.success} utenti${result.failed > 0 ? `, ${result.failed} falliti` : ''}`;
            if (result.failed > 0) this.toast.error(msg);
            else this.toast.success(msg);
            this.loadUsers();
            this.importing.set(false);
          },
          error: () => {
            this.toast.error('Errore durante l\'import');
            this.importing.set(false);
          },
        });
      },
      (err) => {
        this.toast.error(err.message || 'Errore lettura file');
        this.importing.set(false);
      },
    );
    input.value = '';
  }

  readonly Math = Math;

  isActive(status: string): boolean {
    return status === 'ACTIVE';
  }

  statusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Attivo' : 'Inattivo';
  }
}
