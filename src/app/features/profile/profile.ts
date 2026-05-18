import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AppLayout, FormsModule, RouterLink],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  user = this.authService.user;
  saving = signal(false);
  avatarPreview = signal<string | null>(null);

  name = '';
  surname = '';

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.name = u.name;
      this.surname = u.surname;
      this.avatarPreview.set(u.avatar ?? null);
    }
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    this.saving.set(true);
    this.http.put(`${environment.apiUrl}/auth/me`, {
      name: this.name,
      surname: this.surname,
      avatar: this.avatarPreview(),
    }).subscribe({
      next: () => {
        this.authService.refreshMe().subscribe(() => {
          this.toast.success('Profilo aggiornato');
          this.saving.set(false);
        });
      },
      error: (e) => {
        this.toast.error(e.error?.message || 'Errore aggiornamento profilo');
        this.saving.set(false);
      },
    });
  }
}
