import { Component, signal, inject, OnInit } from '@angular/core';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { UserService } from '../../core/services/user.service';
import { CompanyService } from '../../core/services/company.service';
import { RoleService } from '../../core/services/role.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AppLayout],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private userService = inject(UserService);
  private companyService = inject(CompanyService);
  private roleService = inject(RoleService);
  auth = inject(AuthService);

  userCount = signal(0);
  companyCount = signal(0);
  roleCount = signal(0);

  ngOnInit(): void {
    this.userService.getAll().subscribe({ next: (v) => this.userCount.set(v.length) });
    this.companyService.getAll().subscribe({ next: (v) => this.companyCount.set(v.length) });
    this.roleService.getAll().subscribe({ next: (v) => this.roleCount.set(v.length) });
  }
}
