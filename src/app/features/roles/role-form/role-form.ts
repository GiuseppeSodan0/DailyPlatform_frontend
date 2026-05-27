import { Component, signal, computed, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleService, CreateRoleRequest, UpdateRoleRequest } from '../../../core/services/role.service';
import { CompanyService } from '../../../core/services/company.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Role } from '../../../models/role.model';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './role-form.html',
})
export class RoleForm implements OnInit {
  private router = inject(Router);
  private roleService = inject(RoleService);
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  mode = input.required<'create' | 'edit'>();
  role = input<Role | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  companies = signal<any[]>([]);

  canCreateGlobalRole = computed(() => this.authService.hasPermission('ACTION_CREATE_GLOBAL_ROLE'));
  canViewAllCompanies = computed(() => this.authService.hasPermission('CAN_VIEW_ALL_COMPANIES'));

  saving = signal(false);

  roleForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    scope: ['GLOBAL'],
    companyId: [null as number | null],
  });

  ngOnInit(): void {
    this.loadCompanies();

    const source = this.mode() === 'edit' ? this.role() : null;

    if (!source) {
      const defaultScope = this.canCreateGlobalRole() ? 'GLOBAL' : 'TENANT';
      this.roleForm.patchValue({ scope: defaultScope });
    }

    if (source) {
      this.roleForm.patchValue({
        name: source.name,
        description: source.description || '',
        scope: source.scope,
        companyId: source.companyId ?? null,
      });
    }
  }

  private loadCompanies(): void {
    this.companyService.getAll().subscribe({
      next: (c) => this.companies.set(c),
    });
  }

  save(): void {
    if (this.roleForm.invalid) return;
    this.saving.set(true);

    if (this.mode() === 'create') {
      const formValue = this.roleForm.value;
      const data: CreateRoleRequest = {
        name: formValue.name!,
        description: formValue.description || undefined,
        scope: formValue.scope || undefined,
      };
      if (formValue.scope === 'TENANT' && formValue.companyId) {
        data.companyId = formValue.companyId;
      }
      this.roleService.create(data).subscribe({
        next: () => {
          this.toast.success('Ruolo creato');
          this.saving.set(false);
          this.saved.emit();
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(e.error?.message || 'Errore creazione');
          this.saving.set(false);
        },
      });
    } else if (this.mode() === 'edit' && this.role()) {
      const formValue = this.roleForm.value;
      const data: UpdateRoleRequest = {};
      if (formValue.name) data.name = formValue.name;
      if (formValue.description) data.description = formValue.description;
      this.roleService.update(this.role()!.id, data).subscribe({
        next: () => {
          this.toast.success('Ruolo aggiornato');
          this.saving.set(false);
          this.saved.emit();
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(e.error?.message || 'Errore aggiornamento');
          this.saving.set(false);
        },
      });
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
