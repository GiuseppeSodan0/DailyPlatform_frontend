import { Component, Input, Output, EventEmitter, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  permission?: string;
  permissions?: string[];
  tenantAccess?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', permission: 'PAGE_DASHBOARD_VIEW' },
    { label: 'Utenti', route: '/users', icon: 'users', permission: 'PAGE_USER_VIEW' },
    { label: 'Ruoli', route: '/roles', icon: 'roles', permission: 'PAGE_ROLE_VIEW' },
    { label: 'Profili', route: '/profiles', icon: 'permissions', permission: 'PAGE_PERMISSION_VIEW' },
    { label: 'Policies', route: '/policies', icon: 'policies', permission: 'PAGE_PERMISSION_VIEW' },
    { label: 'Aziende', route: '/companies', icon: 'companies', permission: 'PAGE_COMPANY_VIEW' },
    { label: 'Sedi operative', route: '/sedi-operative', icon: 'sedi-operative', permission: 'PAGE_SEDE_OPERATIVA_VIEW' },
    { label: 'Mansione', route: '/mansione', icon: 'mansione', permission: 'PAGE_MANSIONE_VIEW' },
    { label: 'Formazione', route: '/formazione', icon: 'formazione', permission: 'PAGE_FORMAZIONE_VIEW' },
    { label: 'Sorveglianza sanitaria', route: '/sorveglianza-sanitaria', icon: 'sorveglianza-sanitaria', permission: 'PAGE_SORVEGLIANZA_SANITARIA_VIEW' },
    { label: 'Impostazioni', route: '/company-settings', icon: 'settings', permissions: ['SECTION_COMPANY_SETTINGS', 'PAGE_COMPANY_EDIT'], tenantAccess: true },
  ];

  visibleItems = computed(() =>
    this.navItems.filter((item) => {
      if (this.auth.isSuperAdmin()) return true;
      if (item.tenantAccess && this.auth.user()?.companyId) return true;
      if (item.permissions) return this.auth.hasAnyPermission(item.permissions);
      if (item.permission) return this.auth.hasPermission(item.permission);
      return true;
    }),
  );

  private toast = inject(ToastService);

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.auth.refreshMe().subscribe();
  }

  onNavClick(): void {
    this.close.emit();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  refreshPermissions(): void {
    this.auth.refreshMe().subscribe({
      next: (user) => {
        if (user) {
          this.toast.success(`Permessi aggiornati (${user.permissions.length} permessi)`);
        } else {
          this.toast.error('Nessuna sessione attiva');
        }
      },
      error: () => this.toast.error('Errore aggiornamento permessi'),
    });
  }
}
