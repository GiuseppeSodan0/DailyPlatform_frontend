import { Component, signal, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FormazioneService } from '../../../core/services/formazione.service';
import { MansioneService } from '../../../core/services/mansione.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { Formazione, CreateFormazioneRequest, UpdateFormazioneRequest } from '../../../models/formazione.model';
import { StatoFormazione } from '../../../models/stato-formazione.enum';
import { Mansione } from '../../../models/mansione.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-formazione-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './formazione-form.html',
})
export class FormazioneForm implements OnInit {
  private formazioneService = inject(FormazioneService);
  private mansioneService = inject(MansioneService);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  mode = input.required<'create' | 'edit'>();
  formazione = input<Formazione | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  saving = signal(false);
  uploading = signal(false);
  selectedFile: File | null = null;

  mansioni = signal<Mansione[]>([]);
  utenti = signal<User[]>([]);
  statoOptions = Object.values(StatoFormazione);

  form = this.fb.group({
    nomeCorso: ['', [Validators.required]],
    mansioneId: [0 as number | null, [Validators.required, Validators.min(1)]],
    attestato: [''],
    enteFormatore: [''],
    dataRilascio: [''],
    dataScadenza: [''],
    stato: [StatoFormazione.PIANIFICATO, Validators.required],
    validazioneIa: [''],
  });

  selectedUtenteIds: Set<number> = new Set();

  ngOnInit(): void {
    this.mansioneService.getAll().subscribe({
      next: (m) => this.mansioni.set(m),
    });

    this.userService.getAll().subscribe({
      next: (u) => this.utenti.set(u),
    });

    const source = this.mode() === 'edit' ? this.formazione() : null;
    if (source) {
      this.form.patchValue({
        nomeCorso: source.nomeCorso,
        mansioneId: source.mansioneId || null,
        attestato: source.attestato || '',
        enteFormatore: source.enteFormatore || '',
        dataRilascio: source.dataRilascio || '',
        dataScadenza: source.dataScadenza || '',
        stato: source.stato,
        validazioneIa: source.validazioneIa || '',
      });
      this.selectedUtenteIds = new Set(source.partecipanteIds || []);
    }
  }

  toggleUtente(id: number): void {
    if (this.selectedUtenteIds.has(id)) {
      this.selectedUtenteIds.delete(id);
    } else {
      this.selectedUtenteIds.add(id);
    }
  }

  isUtenteSelected(id: number): boolean {
    return this.selectedUtenteIds.has(id);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  private buildPayload(): any {
    const raw = this.form.value;
    const data: any = {};
    data.nomeCorso = raw.nomeCorso;
    data.mansioneId = raw.mansioneId;
    data.stato = raw.stato;
    if (this.selectedUtenteIds.size > 0) {
      data.partecipanteIds = Array.from(this.selectedUtenteIds);
    }
    if (raw.attestato) data.attestato = raw.attestato;
    if (raw.enteFormatore) data.enteFormatore = raw.enteFormatore;
    if (raw.dataRilascio) data.dataRilascio = raw.dataRilascio;
    if (raw.dataScadenza) data.dataScadenza = raw.dataScadenza;
    if (raw.validazioneIa) data.validazioneIa = raw.validazioneIa;
    return data;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    if (this.mode() === 'create') {
      this.formazioneService.create(this.buildPayload() as CreateFormazioneRequest).subscribe({
        next: (created) => {
          if (this.selectedFile) {
            this.uploadFile(created.id);
          } else {
            this.toast.success('Formazione creata con successo');
            this.saving.set(false);
            this.saved.emit();
          }
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(e.error?.message || 'Errore durante la creazione');
          this.saving.set(false);
        },
      });
    } else if (this.mode() === 'edit' && this.formazione()) {
      this.formazioneService.update(this.formazione()!.id, this.buildPayload() as UpdateFormazioneRequest).subscribe({
        next: (updated) => {
          if (this.selectedFile) {
            this.uploadFile(updated.id);
          } else {
            this.toast.success('Formazione aggiornata con successo');
            this.saving.set(false);
            this.saved.emit();
          }
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(e.error?.message || 'Errore durante l\'aggiornamento');
          this.saving.set(false);
        },
      });
    }
  }

  private uploadFile(id: number): void {
    this.uploading.set(true);
    this.formazioneService.uploadAllegato(id, this.selectedFile!).subscribe({
      next: () => {
        this.toast.success('File caricato con successo');
        this.uploading.set(false);
        this.saved.emit();
      },
      error: () => {
        this.toast.error('Errore nel caricamento del file');
        this.uploading.set(false);
        this.saved.emit();
      },
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
