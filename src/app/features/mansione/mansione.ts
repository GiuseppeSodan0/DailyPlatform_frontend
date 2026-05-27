import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { MansioneService } from '../../core/services/mansione.service';
import { ToastService } from '../../core/services/toast.service';
import { Mansione } from '../../models/mansione.model';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmModal } from '../../shared/components/confirm-modal';
import { NoUnderscorePipe } from '../../shared/pipes/no-underscore';

@Component({
  selector: 'app-mansione-list',
  standalone: true,
  imports: [AppLayout, RouterLink, FormsModule, HasPermissionDirective, ConfirmModal, NoUnderscorePipe],
  templateUrl: './mansione.html',
})
export class MansioneList implements OnInit {
  private router = inject(Router);
  private mansioneService = inject(MansioneService);
  private toast = inject(ToastService);

  mansioni = signal<Mansione[]>([]);
  searchInput = '';
  searchQuery = signal('');
  loading = signal(false);
  deleteTarget: Mansione | null = null;

  currentPage = signal(1);
  pageSize = 15;

  filteredMansioni = computed(() => {
    let result = this.mansioni();
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(
        (m) =>
          m.nomeMansione.toLowerCase().includes(query) ||
          (m.descrizione && m.descrizione.toLowerCase().includes(query)),
      );
    }
    return result;
  });

  pagedMansioni = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredMansioni().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredMansioni().length / this.pageSize)));

  ngOnInit(): void {
    this.loadMansioni();
  }

  private loadMansioni(): void {
    this.loading.set(true);
    this.mansioneService.getAll().subscribe({
      next: (m) => {
        this.mansioni.set(m);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  search(): void {
    this.searchQuery.set(this.searchInput);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchInput = '';
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/mansione', id]);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/mansione', id, 'edit']);
  }

  confirmDelete(mansione: Mansione): void {
    this.deleteTarget = mansione;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    this.mansioneService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Mansione eliminata con successo');
        this.deleteTarget = null;
        this.loadMansioni();
      },
      error: (e) => {
        this.toast.error(e.error?.message || 'Errore durante l\'eliminazione');
        this.deleteTarget = null;
      },
    });
  }

  isActive(status: string | undefined): boolean {
    return status === 'ACTIVE';
  }

  statusLabel(status: string | undefined): string {
    return status === 'ACTIVE' ? 'Attivo' : 'Inattivo';
  }

  readonly Math = Math;
  readonly Number = Number;
}
