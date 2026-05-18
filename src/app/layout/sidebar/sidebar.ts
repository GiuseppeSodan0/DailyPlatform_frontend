import { Component, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  permission?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', permission: 'PAGE_DASHBOARD_VIEW' },
    { label: 'Utenti', route: '/users', icon: 'users', permission: 'PAGE_USER_VIEW' },
    { label: 'Ruoli', route: '/roles', icon: 'roles', permission: 'PAGE_ROLE_VIEW' },
    { label: 'Aziende', route: '/companies', icon: 'companies', permission: 'PAGE_COMPANY_VIEW' },
  ];

  visibleItems = computed(() =>
    this.navItems.filter((item) => {
      if (!item.permission) return true;
      return this.auth.hasPermission(item.permission);
    }),
  );

  private toast = inject(ToastService);

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {}

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
