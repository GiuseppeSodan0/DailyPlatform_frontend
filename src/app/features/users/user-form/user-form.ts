import { Component, signal, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { UserService, CreateUserRequest, UpdateUserRequest } from '../../../core/services/user.service';
import { CompanyService } from '../../../core/services/company.service';
import { RoleService } from '../../../core/services/role.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../models/user.model';
import { Role } from '../../../models/role.model';
import { NoUnderscorePipe } from '../../../shared/pipes/no-underscore';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, NoUnderscorePipe],
  templateUrl: './user-form.html',
})
export class UserForm implements OnInit {
  protected auth = inject(AuthService);
  private userService = inject(UserService);
  private companyService = inject(CompanyService);
  private roleService = inject(RoleService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  mode = input.required<'create' | 'edit'>();
  user = input<User | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  allRoles = signal<Role[]>([]);
  allCompanies = signal<any[]>([]);
  loadingRoles = signal(false);
  saving = signal(false);

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    name: ['', Validators.required],
    surname: ['', Validators.required],
    status: ['ACTIVE', Validators.required],
    companyId: [null as number | null],
    roleIds: [[] as number[]],
  });

  ngOnInit(): void {
    if (this.mode() === 'edit') {
      this.userForm.get('password')?.clearValidators();
    }
    this.loadCompanies();
    this.loadRoles();
    if (this.mode() === 'edit' && this.user()) {
      this.patchFormValues(this.user()!);
    }
  }

  private loadCompanies(): void {
    this.companyService.getAll().subscribe({
      next: (c) => this.allCompanies.set(c),
    });
  }

  private loadRoles(): void {
    this.loadingRoles.set(true);
    this.roleService.getAll().subscribe({
      next: (r) => {
        this.allRoles.set(r);
        this.loadingRoles.set(false);
        if (this.mode() === 'edit' && this.user()) {
          const roleIds = r
            .filter((role) => this.user()!.roles.includes(role.name))
            .map((role) => role.id);
          this.userForm.patchValue({ roleIds });
        }
      },
      error: () => this.loadingRoles.set(false),
    });
  }

  private patchFormValues(user: User): void {
    this.userForm.patchValue({
      email: user.email,
      password: '',
      name: user.name,
      surname: user.surname,
      status: user.status,
      companyId: user.companyId,
    });
  }

  save(): void {
    if (this.userForm.invalid) return;
    this.saving.set(true);

    if (this.mode() === 'create') {
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
        next: () => {
          this.toast.success('Utente creato con successo');
          this.saving.set(false);
          this.saved.emit();
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(e.error?.message || 'Errore durante la creazione');
          this.saving.set(false);
        },
      });
    } else if (this.mode() === 'edit' && this.user()) {
      const data: UpdateUserRequest = {};
      const raw = this.userForm.value;
      if (raw.email) data.email = raw.email;
      if (raw.name) data.name = raw.name;
      if (raw.surname) data.surname = raw.surname;
      if (raw.status) data.status = raw.status;
      if (raw.password) data.password = raw.password;
      if (raw.companyId !== null && raw.companyId !== undefined) data.companyId = raw.companyId;
      if (raw.roleIds) data.roleIds = raw.roleIds;
      this.userService.update(this.user()!.id, data).subscribe({
        next: () => {
          this.toast.success('Utente aggiornato con successo');
          this.saving.set(false);
          this.saved.emit();
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(e.error?.message || "Errore durante l'aggiornamento");
          this.saving.set(false);
        },
      });
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }

  toggleRole(roleId: number): void {
    const current = this.userForm.value.roleIds ?? [];
    const updated = current.includes(roleId)
      ? current.filter((id) => id !== roleId)
      : [...current, roleId];
    this.userForm.patchValue({ roleIds: updated });
  }
}
