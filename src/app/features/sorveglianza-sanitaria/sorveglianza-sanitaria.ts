import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { SorveglianzaSanitariaService } from '../../core/services/sorveglianza-sanitaria.service';
import { ToastService } from '../../core/services/toast.service';
import { SorveglianzaSanitaria } from '../../models/sorveglianza-sanitaria.model';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmModal } from '../../shared/components/confirm-modal';

@Component({
  selector: 'app-sorveglianza-sanitaria-list',
  standalone: true,
  imports: [AppLayout, RouterLink, FormsModule, HasPermissionDirective, ConfirmModal],
  templateUrl: './sorveglianza-sanitaria.html',
})
export class SorveglianzaSanitariaList implements OnInit {
  private router = inject(Router);
  private sorveglianzaSanitariaService = inject(SorveglianzaSanitariaService);
  private toast = inject(ToastService);

  items = signal<SorveglianzaSanitaria[]>([]);
  searchInput = '';
  searchQuery = signal('');
  loading = signal(false);
  deleteTarget: SorveglianzaSanitaria | null = null;

  currentPage = signal(1);
  pageSize = 15;

  filteredItems = computed(() => {
    let result = this.items();
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(
        (s) =>
          (s.lavoratoreNome && s.lavoratoreNome.toLowerCase().includes(query)) ||
          (s.lavoratoreCognome && s.lavoratoreCognome.toLowerCase().includes(query)) ||
          (s.mansioneNome && s.mansioneNome.toLowerCase().includes(query)) ||
          (s.medicoCompetente && s.medicoCompetente.toLowerCase().includes(query)),
      );
    }
    return result;
  });

  pagedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredItems().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize)));

  ngOnInit(): void {
    this.loadItems();
  }

  private loadItems(): void {
    this.loading.set(true);
    this.sorveglianzaSanitariaService.getAll().subscribe({
      next: (data) => {
        this.items.set(data);
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
    this.router.navigate(['/sorveglianza-sanitaria', id]);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/sorveglianza-sanitaria', id, 'edit']);
  }

  confirmDelete(item: SorveglianzaSanitaria): void {
    this.deleteTarget = item;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    this.sorveglianzaSanitariaService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Sorveglianza sanitaria eliminata con successo');
        this.deleteTarget = null;
        this.loadItems();
      },
      error: (e) => {
        this.toast.error(e.error?.message || 'Errore durante l\'eliminazione');
        this.deleteTarget = null;
      },
    });
  }

  giudizioLabel(giudizio: string | undefined): string {
    const labels: Record<string, string> = {
      IDONEO: 'Idoneo',
      IDONEO_CON_PRESCRIZIONI: 'Idoneo con prescrizioni',
      INIDONEO: 'Inidoneo',
      DA_VERIFICARE: 'Da verificare',
    };
    return giudizio ? labels[giudizio] || giudizio : '-';
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
