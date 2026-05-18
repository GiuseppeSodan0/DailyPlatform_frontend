import { Component, signal } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { ToastContainer } from '../../shared/components/toast-container';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Header, Sidebar, ToastContainer],
  templateUrl: './app-layout.html',
})
export class AppLayout {
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
