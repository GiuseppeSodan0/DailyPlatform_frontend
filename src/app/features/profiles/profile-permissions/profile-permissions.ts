import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { ProfileService } from '../../../core/services/profile.service';
import { PermissionService } from '../../../core/services/permission.service';
import { ToastService } from '../../../core/services/toast.service';
import { Profile } from '../../../models/profile.model';
import { Permission } from '../../../models/permission.model';

interface PermissionEntry {
  action: string;
  permission: Permission;
}

interface PermissionGroup {
  entityName: string;
  items: PermissionEntry[];
}

function parsePermissionName(name: string): { action: string; entity: string } {
  const parts = name.trim().toLowerCase().split(/\s+/);
  const action = parts[0] ?? '';
  const entity = parts.slice(1).join(' ') || action;
  return { action, entity };
}

@Component({
  selector: 'app-profile-permissions',
  standalone: true,
  imports: [AppLayout, RouterLink],
  templateUrl: './profile-permissions.html',
})
export class ProfilePermissions implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private permissionService = inject(PermissionService);
  private toast = inject(ToastService);

  profile = signal<Profile | null>(null);
  allPermissions = signal<Permission[]>([]);
  selectedIds = signal<Set<number>>(new Set());
  loading = signal(true);
  saving = signal(false);

  profileName = computed(() => this.profile()?.name ?? '');
  profileId = computed(() => this.profile()?.id ?? 0);

  groupedPermissions = computed(() => {
    const map = new Map<string, PermissionEntry[]>();
    for (const perm of this.allPermissions()) {
      const { action, entity } = parsePermissionName(perm.name);
      const entityName = this.capitalize(entity);
      if (!map.has(entityName)) map.set(entityName, []);
      map.get(entityName)!.push({ action, permission: perm });
    }
    return Array.from(map.entries())
      .map(([entityName, items]) => ({ entityName, items }))
      .sort((a, b) => a.entityName.localeCompare(b.entityName));
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.router.navigate(['/profiles']);
      return;
    }

    this.profileService.getById(id).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.selectedIds.set(new Set((profile.permissions ?? []).map(p => p.id)));
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Profilo non trovato');
        this.router.navigate(['/profiles']);
      },
    });

    this.permissionService.getAll().subscribe({
      next: (perms) => this.allPermissions.set(perms),
    });
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  toggle(permId: number): void {
    this.selectedIds.update(ids => {
      const next = new Set(ids);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  }

  save(): void {
    const ids = Array.from(this.selectedIds());
    const permissions = ids.map(permissionId => ({
      permissionId,
      visible: true,
      inhibitor: false,
    }));
    this.saving.set(true);
    this.profileService.addPermissions(this.profileId(), { permissions }).subscribe({
      next: () => {
        this.toast.success('Permessi aggiornati');
        this.saving.set(false);
        this.router.navigate(['/profiles']);
      },
      error: (e: HttpErrorResponse) => {
        this.toast.error(e.error?.message || 'Errore assegnazione permessi');
        this.saving.set(false);
      },
    });
  }
}
