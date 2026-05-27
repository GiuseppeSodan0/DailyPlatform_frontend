import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { FormazioneService } from '../../core/services/formazione.service';
import { ToastService } from '../../core/services/toast.service';
import { Formazione } from '../../models/formazione.model';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmModal } from '../../shared/components/confirm-modal';

@Component({
  selector: 'app-formazione-list',
  standalone: true,
  imports: [AppLayout, RouterLink, FormsModule, HasPermissionDirective, ConfirmModal],
  templateUrl: './formazione.html',
})
export class FormazioneList implements OnInit {
  private router = inject(Router);
  private formazioneService = inject(FormazioneService);
  private toast = inject(ToastService);

  formazioni = signal<Formazione[]>([]);
  searchInput = '';
  searchQuery = signal('');
  loading = signal(false);
  deleteTarget: Formazione | null = null;

  currentPage = signal(1);
  pageSize = 15;

  filteredFormazioni = computed(() => {
    let result = this.formazioni();
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(
        (f) =>
          f.nomeCorso.toLowerCase().includes(query) ||
          (f.mansioneNome && f.mansioneNome.toLowerCase().includes(query)) ||
          (f.enteFormatore && f.enteFormatore.toLowerCase().includes(query)),
      );
    }
    return result;
  });

  pagedFormazioni = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredFormazioni().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredFormazioni().length / this.pageSize)));

  ngOnInit(): void {
    this.loadFormazioni();
  }

  private loadFormazioni(): void {
    this.loading.set(true);
    this.formazioneService.getAll().subscribe({
      next: (f) => {
        this.formazioni.set(f);
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
    this.router.navigate(['/formazione', id]);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/formazione', id, 'edit']);
  }

  confirmDelete(formazione: Formazione): void {
    this.deleteTarget = formazione;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    this.formazioneService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Formazione eliminata con successo');
        this.deleteTarget = null;
        this.loadFormazioni();
      },
      error: (e) => {
        this.toast.error(e.error?.message || 'Errore durante l\'eliminazione');
        this.deleteTarget = null;
      },
    });
  }

  statoLabel(stato: string | undefined): string {
    const labels: Record<string, string> = {
      PIANIFICATO: 'Pianificato',
      IN_CORSO: 'In corso',
      COMPLETATO: 'Completato',
      SCADUTO: 'Scaduto',
    };
    return stato ? labels[stato] || stato : '-';
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
