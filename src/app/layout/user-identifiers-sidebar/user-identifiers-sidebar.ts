import { Component, input, signal, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-identifiers-sidebar',
  standalone: true,
  templateUrl: './user-identifiers-sidebar.html',
})
export class UserIdentifiersSidebar {
  readonly user = input<User | null>(null);

  protected open = signal(false);
  protected auth = inject(AuthService);

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected close(): void {
    this.open.set(false);
  }
}
