import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { UserForm } from '../user-form/user-form';

@Component({
  selector: 'app-user-create-page',
  standalone: true,
  imports: [AppLayout, UserForm],
  templateUrl: './user-create-page.html',
})
export class UserCreatePage {
  private router = inject(Router);

  onSaved(): void {
    this.router.navigate(['/users']);
  }

  onCancelled(): void {
    this.router.navigate(['/users']);
  }
}
