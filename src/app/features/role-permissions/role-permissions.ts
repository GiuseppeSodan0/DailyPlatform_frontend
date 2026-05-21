import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { RoleService } from '../../core/services/role.service';
import { PermissionService } from '../../core/services/permission.service';
import { ToastService } from '../../core/services/toast.service';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';

interface PermissionEntry {
  action: string;
  permission: Permission;
}

interface PermissionGroup {
  entityName: string;
  items: PermissionEntry[];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function parsePermissionName(name: string): { action: string; entity: string } {
  const parts = name.trim().toLowerCase().split(/\s+/);
  const action = parts[0] ?? '';
  const entity = parts.slice(1).join(' ') || action;
  return { action, entity };
}

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [AppLayout, RouterLink],
  templateUrl: './role-permissions.html',
})
export class RolePermissions implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);
  private toast = inject(ToastService);

  role = signal<Role | null>(null);
  parentRole = signal<Role | null>(null);
  allPermissions = signal<Permission[]>([]);
  selectedIds = signal<Set<number>>(new Set());
  loading = signal(true);
  loadingParent = signal(false);
  saving = signal(false);

  roleName = computed(() => this.role()?.name ?? '');
  roleId = computed(() => this.role()?.id ?? 0);

  parentRoleName = computed(() => this.parentRole()?.name ?? null);

  availablePermissions = computed(() => {
    const all = this.allPermissions();
    const parent = this.parentRole();
    if (!parent) return all;
    const parentIds = new Set((parent.permissions ?? []).map(p => p.id));
    return all.filter(p => parentIds.has(p.id));
  });

  groupedPermissions = computed(() => {
    const map = new Map<string, PermissionEntry[]>();
    for (const perm of this.availablePermissions()) {
      const { action, entity } = parsePermissionName(perm.name);
      const entityName = capitalize(entity);
      if (!map.has(entityName)) map.set(entityName, []);
      map.get(entityName)!.push({ action, permission: perm });
    }
    return Array.from(map.entries())
      .map(([entityName, items]) => ({ entityName, items }))
      .sort((a, b) => a.entityName.localeCompare(b.entityName));
  });

  private parentIdFromQuery = 0;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.parentIdFromQuery = Number(this.route.snapshot.queryParamMap.get('parentId')) || 0;

    if (!id) {
      this.router.navigate(['/roles']);
      return;
    }

    this.roleService.getById(id).subscribe({
      next: (role) => {
        const parentId = role.parentId || this.parentIdFromQuery || null;
        const roleWithParent = parentId ? { ...role, parentId } : role;
        this.role.set(roleWithParent);
        this.selectedIds.set(new Set((roleWithParent.permissions ?? []).map(p => p.id)));
        this.loading.set(false);

        if (roleWithParent.parentId) {
          this.loadingParent.set(true);
          this.roleService.getById(roleWithParent.parentId).subscribe({
            next: (parent) => {
              this.parentRole.set(parent);
              this.loadingParent.set(false);
              this.syncPermissionsWithParent(parent);
            },
            error: () => {
              this.toast.show('Ruolo padre non trovato, mostra tutti i permessi', 'info');
              this.loadingParent.set(false);
            },
          });
        }
      },
      error: () => {
        this.toast.error('Ruolo non trovato');
        this.router.navigate(['/roles']);
      },
    });

    this.permissionService.getAll().subscribe({
      next: (perms) => this.allPermissions.set(perms),
    });
  }

  private syncPermissionsWithParent(parent: Role): void {
    const parentPerms = parent.permissions ?? [];
    const parentIds = new Set(parentPerms.map(p => p.id));
    const currentIds = this.selectedIds();

    if (currentIds.size === 0) {
      this.selectedIds.set(new Set(parentPerms.map(p => p.id)));
      return;
    }

    const incompatible = Array.from(currentIds).filter(id => !parentIds.has(id));
    if (incompatible.length > 0) {
      const next = new Set(currentIds);
      incompatible.forEach(id => next.delete(id));
      this.selectedIds.set(next);
      this.toast.show(`${incompatible.length} permesso/i non più compatibili con il ruolo padre sono stati rimossi.`, 'info');
    }
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
    this.saving.set(true);
    this.roleService.addPermissions(this.roleId(), { permissionIds: ids }).subscribe({
      next: () => {
        this.toast.success('Permessi aggiornati');
        this.saving.set(false);
        this.router.navigate(['/roles']);
      },
      error: (e) => {
        this.toast.error(e.error?.message || 'Errore assegnazione permessi');
        this.saving.set(false);
      },
    });
  }
}
