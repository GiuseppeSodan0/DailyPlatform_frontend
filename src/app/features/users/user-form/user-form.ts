import { Component, signal, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { UserService, CreateUserRequest, UpdateUserRequest } from '../../../core/services/user.service';
import { CompanyService } from '../../../core/services/company.service';
import { RoleService } from '../../../core/services/role.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { SedeOperativaService } from '../../../core/services/sede-operativa.service';
import { User } from '../../../models/user.model';
import { Role } from '../../../models/role.model';
import { Profile } from '../../../models/profile.model';
import { SedeOperativa } from '../../../models/sede-operativa.model';
import { Reparto } from '../../../models/reparto.enum';
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
  private profileService = inject(ProfileService);
  private sedeOperativaService = inject(SedeOperativaService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  mode = input.required<'create' | 'edit'>();
  user = input<User | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  repartoOptions = Object.values(Reparto);

  allRoles = signal<Role[]>([]);
  allProfiles = signal<Profile[]>([]);
  allCompanies = signal<any[]>([]);
  allSedi = signal<SedeOperativa[]>([]);
  loadingRoles = signal(false);
  saving = signal(false);

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    name: ['', Validators.required],
    surname: ['', Validators.required],
    status: ['ACTIVE', Validators.required],
    companyId: [null as number | null],
    sedeOperativaId: [null as number | null],
    reparto: [null as string | null],
    roleIds: [[] as number[]],
    profileIds: [[] as number[]],
  });

  ngOnInit(): void {
    if (this.mode() === 'edit') {
      this.userForm.get('password')?.clearValidators();
    }
    this.loadCompanies();
    this.loadProfiles();
    if (this.mode() === 'edit' && this.user()) {
      this.loadRolesByCompany(this.user()!.companyId ?? null);
      this.patchFormValues(this.user()!);
    }

    this.userForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.userForm.patchValue({ sedeOperativaId: null, reparto: null });
      if (companyId) {
        this.loadSedi(companyId);
        this.loadRolesByCompany(companyId);
      } else {
        this.allSedi.set([]);
        this.loadRolesByCompany(null);
      }
    });

    this.userForm.get('sedeOperativaId')?.valueChanges.subscribe((sedeId) => {
      const repartoCtrl = this.userForm.get('reparto');
      if (sedeId) {
        repartoCtrl?.setValidators(Validators.required);
      } else {
        repartoCtrl?.clearValidators();
        repartoCtrl?.setValue(null);
      }
      repartoCtrl?.updateValueAndValidity();
    });
  }

  private loadCompanies(): void {
    this.companyService.getAll().subscribe({
      next: (c) => this.allCompanies.set(c),
    });
  }

  private loadSedi(companyId: number): void {
    this.sedeOperativaService.getByCompanyId(companyId).subscribe({
      next: (sedi) => this.allSedi.set(sedi),
    });
  }

  private loadProfiles(): void {
    this.profileService.getAll().subscribe({
      next: (p) => {
        this.allProfiles.set(p);
        if (this.mode() === 'edit' && this.user()) {
          const profileIds = p
            .filter((prof) => this.user()!.profiles.includes(prof.code))
            .map((prof) => prof.id);
          this.userForm.patchValue({ profileIds });
        }
      },
    });
  }

  private loadRolesByCompany(_companyId: number | null): void {
    this.loadingRoles.set(true);
    const contextCompanyId = this.auth.user()?.companyId ?? null;
    this.roleService.getAll().subscribe({
      next: (r) => {
        const filtered = r.filter((role) => {
          // Ruoli globali: nessun companyId associato
          if (!role.companyId) {
            if (contextCompanyId && role.name === 'SUPER_ADMIN') return false;
            return true;
          }
          // Ruoli della company dell'utente loggato (la API filtra già per questo contesto)
          if (contextCompanyId && role.companyId === contextCompanyId) return true;
          return false;
        });
        this.allRoles.set(filtered);
        this.loadingRoles.set(false);
        if (this.mode() === 'edit' && this.user()) {
          const roleIds = filtered
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
      sedeOperativaId: user.sedeOperativaId ?? null,
      reparto: user.reparto ?? null,
    });
    if (user.companyId) {
      this.loadSedi(user.companyId);
    }
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
        sedeOperativaId: this.userForm.value.sedeOperativaId ?? null,
        reparto: this.userForm.value.reparto ?? null,
        roleIds: this.userForm.value.roleIds ?? undefined,
        profileIds: this.userForm.value.profileIds ?? undefined,
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
      if (raw.sedeOperativaId !== null && raw.sedeOperativaId !== undefined) data.sedeOperativaId = raw.sedeOperativaId;
      if (raw.reparto !== null && raw.reparto !== undefined) data.reparto = raw.reparto;
      if (raw.roleIds) data.roleIds = raw.roleIds;
      if (raw.profileIds) data.profileIds = raw.profileIds;

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

  toggleProfile(profileId: number): void {
    const current = this.userForm.value.profileIds ?? [];
    const updated = current.includes(profileId)
      ? current.filter((id) => id !== profileId)
      : [...current, profileId];
    this.userForm.patchValue({ profileIds: updated });
  }
}
