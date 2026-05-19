import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { RoleForm } from '../role-form/role-form';

@Component({
  selector: 'app-role-create-page',
  standalone: true,
  imports: [AppLayout, RoleForm],
  templateUrl: './role-create-page.html',
})
export class RoleCreatePage {
  private router = inject(Router);

  onSaved(): void {
    this.router.navigate(['/roles']);
  }

  onCancelled(): void {
    this.router.navigate(['/roles']);
  }
}
