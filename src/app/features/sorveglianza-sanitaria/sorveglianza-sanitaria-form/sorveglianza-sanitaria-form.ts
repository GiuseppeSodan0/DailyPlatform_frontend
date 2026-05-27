import { Component, signal, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SorveglianzaSanitariaService } from '../../../core/services/sorveglianza-sanitaria.service';
import { MansioneService } from '../../../core/services/mansione.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { SorveglianzaSanitaria, CreateSorveglianzaSanitariaRequest, UpdateSorveglianzaSanitariaRequest } from '../../../models/sorveglianza-sanitaria.model';
import { GiudizioIdoneita } from '../../../models/giudizio-idoneita.enum';
import { Mansione } from '../../../models/mansione.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-sorveglianza-sanitaria-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './sorveglianza-sanitaria-form.html',
})
export class SorveglianzaSanitariaForm implements OnInit {
  private sorveglianzaSanitariaService = inject(SorveglianzaSanitariaService);
  private mansioneService = inject(MansioneService);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  mode = input.required<'create' | 'edit'>();
  sorveglianzaSanitaria = input<SorveglianzaSanitaria | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  saving = signal(false);
  uploading = signal(false);
  selectedFile: File | null = null;

  lavoratori = signal<User[]>([]);
  mansioni = signal<Mansione[]>([]);
  giudizioOptions = Object.values(GiudizioIdoneita);

  form = this.fb.group({
    fkLavoratore: [0 as number | null, [Validators.required, Validators.min(1)]],
    fkMansione: [0 as number | null, [Validators.required, Validators.min(1)]],
    rischiSanitari: [''],
    protocolloSanitario: [''],
    visitaPrevista: [''],
    visitaEffettuata: [''],
    scadenza: [''],
    giudizioIdoneita: [GiudizioIdoneita.DA_VERIFICARE, Validators.required],
    limitazioniPrescrizioni: [''],
    medicoCompetente: [''],
  });

  ngOnInit(): void {
    this.userService.getAll().subscribe({
      next: (u) => this.lavoratori.set(u),
    });

    this.mansioneService.getAll().subscribe({
      next: (m) => this.mansioni.set(m),
    });

    const source = this.mode() === 'edit' ? this.sorveglianzaSanitaria() : null;
    if (source) {
      this.form.patchValue({
        fkLavoratore: source.fkLavoratore || null,
        fkMansione: source.fkMansione || null,
        rischiSanitari: source.rischiSanitari || '',
        protocolloSanitario: source.protocolloSanitario || '',
        visitaPrevista: source.visitaPrevista || '',
        visitaEffettuata: source.visitaEffettuata || '',
        scadenza: source.scadenza || '',
        giudizioIdoneita: source.giudizioIdoneita,
        limitazioniPrescrizioni: source.limitazioniPrescrizioni || '',
        medicoCompetente: source.medicoCompetente || '',
      });
    }
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
    data.fkLavoratore = raw.fkLavoratore;
    data.fkMansione = raw.fkMansione;
    data.giudizioIdoneita = raw.giudizioIdoneita;
    if (raw.rischiSanitari) data.rischiSanitari = raw.rischiSanitari;
    if (raw.protocolloSanitario) data.protocolloSanitario = raw.protocolloSanitario;
    if (raw.visitaPrevista) data.visitaPrevista = raw.visitaPrevista;
    if (raw.visitaEffettuata) data.visitaEffettuata = raw.visitaEffettuata;
    if (raw.scadenza) data.scadenza = raw.scadenza;
    if (raw.limitazioniPrescrizioni) data.limitazioniPrescrizioni = raw.limitazioniPrescrizioni;
    if (raw.medicoCompetente) data.medicoCompetente = raw.medicoCompetente;
    return data;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    if (this.mode() === 'create') {
      this.sorveglianzaSanitariaService.create(this.buildPayload() as CreateSorveglianzaSanitariaRequest).subscribe({
        next: (created) => {
          if (this.selectedFile) {
            this.uploadFile(created.id);
          } else {
            this.toast.success('Sorveglianza sanitaria creata con successo');
            this.saving.set(false);
            this.saved.emit();
          }
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(e.error?.message || 'Errore durante la creazione');
          this.saving.set(false);
        },
      });
    } else if (this.mode() === 'edit' && this.sorveglianzaSanitaria()) {
      this.sorveglianzaSanitariaService.update(this.sorveglianzaSanitaria()!.id, this.buildPayload() as UpdateSorveglianzaSanitariaRequest).subscribe({
        next: (updated) => {
          if (this.selectedFile) {
            this.uploadFile(updated.id);
          } else {
            this.toast.success('Sorveglianza sanitaria aggiornata con successo');
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
    this.sorveglianzaSanitariaService.uploadAllegato(id, this.selectedFile!).subscribe({
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

  giudizioLabel(giudizio: string): string {
    const labels: Record<string, string> = {
      IDONEO: 'Idoneo',
      IDONEO_CON_PRESCRIZIONI: 'Idoneo con prescrizioni',
      INIDONEO: 'Inidoneo',
      DA_VERIFICARE: 'Da verificare',
    };
    return labels[giudizio] || giudizio;
  }
}
