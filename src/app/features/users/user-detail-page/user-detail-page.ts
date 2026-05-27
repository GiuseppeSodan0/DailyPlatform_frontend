import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { UserIdentifiersSidebar } from '../../../layout/user-identifiers-sidebar/user-identifiers-sidebar';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user.model';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { NoUnderscorePipe } from '../../../shared/pipes/no-underscore';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [AppLayout, UserIdentifiersSidebar, HasPermissionDirective, NoUnderscorePipe],
  templateUrl: './user-detail-page.html',
})
export class UserDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  user = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  notFound = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = Number(params.get('id'));
          this.loading.set(true);
          this.error.set(null);
          this.notFound.set(false);
          return this.userService.getById(id);
        }),
      )
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 404) {
            this.notFound.set(true);
          } else {
            this.error.set(err.error?.message || "Errore nel caricamento dell'utente");
          }
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/users', id, 'edit']);
  }

  isActive(status: string): boolean {
    return status === 'ACTIVE';
  }

  statusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Attivo' : 'Inattivo';
  }
}
