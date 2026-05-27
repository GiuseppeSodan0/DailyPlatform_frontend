import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../core/services/toast.service';
import { Profile } from '../../models/profile.model';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmModal } from '../../shared/components/confirm-modal';
import { ModalWrapper } from '../../shared/components/modal-wrapper';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [AppLayout, HasPermissionDirective, ConfirmModal, ModalWrapper, FormsModule],
  templateUrl: './profiles.html',
})
export class Profiles implements OnInit {
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);

  profiles = signal<Profile[]>([]);
  loading = signal(false);

  currentPage = signal(1);
  pageSize = 15;

  statusFilter = signal('');

  modalMode: 'edit' | null = null;
  selectedProfile: Profile | null = null;
  deleteTarget: Profile | null = null;
  saving = signal(false);

  editForm = {
    name: '',
    description: '',
  };

  filteredProfiles = computed(() => {
    let result = this.profiles();
    const s = this.statusFilter();
    if (s) {
      result = result.filter(p => p.status === s);
    }
    return result;
  });

  pagedProfiles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProfiles().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProfiles().length / this.pageSize)));

  ngOnInit(): void {
    this.loadProfiles();
  }

  private loadProfiles(): void {
    this.loading.set(true);
    this.profileService.getAll().subscribe({
      next: (p) => { this.profiles.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  openEdit(profile: Profile): void {
    this.modalMode = 'edit';
    this.selectedProfile = profile;
    this.editForm = { name: profile.name, description: profile.description || '' };
  }

  closeModal(): void {
    this.modalMode = null;
    this.selectedProfile = null;
  }

  saveEdit(): void {
    if (!this.selectedProfile || !this.editForm.name) return;
    this.saving.set(true);
    this.profileService.update(this.selectedProfile.id, {
      name: this.editForm.name,
      description: this.editForm.description,
    }).subscribe({
      next: () => { this.toast.success('Profilo aggiornato'); this.closeModal(); this.loadProfiles(); this.saving.set(false); },
      error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore'); this.saving.set(false); },
    });
  }

  openPermissions(profile: Profile): void {
    this.router.navigate(['/profiles', profile.id, 'permissions']);
  }

  confirmDelete(profile: Profile): void {
    this.deleteTarget = profile;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    this.profileService.delete(this.deleteTarget.id).subscribe({
      next: () => { this.toast.success('Profilo eliminato'); this.deleteTarget = null; this.loadProfiles(); },
      error: (e: HttpErrorResponse) => { this.toast.error(e.error?.message || 'Errore eliminazione'); this.deleteTarget = null; },
    });
  }

  toggleStatus(profile: Profile): void {
    const newStatus = profile.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.profileService.update(profile.id, { status: newStatus }).subscribe({
      next: () => {
        this.toast.success(newStatus === 'ACTIVE' ? 'Profilo attivato' : 'Profilo disattivato');
        this.loadProfiles();
      },
      error: (e: HttpErrorResponse) => this.toast.error(e.error?.message || 'Errore aggiornamento stato'),
    });
  }

  isActive(status: string): boolean {
    return status === 'ACTIVE';
  }
}
