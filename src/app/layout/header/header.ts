import { Component, Output, EventEmitter, signal, inject, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
})
export class Header {
  @Output() menuToggle = new EventEmitter<void>();
  protected auth = inject(AuthService);

  showProfileMenu = signal(false);

  toggleProfileMenu(): void {
    this.showProfileMenu.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showProfileMenu()) {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu-container')) {
        this.showProfileMenu.set(false);
      }
    }
  }
}
