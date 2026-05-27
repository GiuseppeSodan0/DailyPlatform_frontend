import { Component, signal, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MansioneService } from '../../../core/services/mansione.service';
import { ToastService } from '../../../core/services/toast.service';
import { Mansione, CreateMansioneRequest, UpdateMansioneRequest } from '../../../models/mansione.model';
import { RischioLavorativo } from '../../../models/rischio-lavorativo.enum';
import { DPI } from '../../../models/dpi.enum';
import { NoUnderscorePipe } from '../../../shared/pipes/no-underscore';

@Component({
  selector: 'app-mansione-form',
  standalone: true,
  imports: [ReactiveFormsModule, NoUnderscorePipe],
  templateUrl: './mansione-form.html',
})
export class MansioneForm implements OnInit {
  private mansioneService = inject(MansioneService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  mode = input.required<'create' | 'edit'>();
  mansione = input<Mansione | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  saving = signal(false);
  rischiOptions = Object.values(RischioLavorativo);
  dpiOptions = Object.values(DPI);

  form = this.fb.group({
    nomeMansione: ['', [Validators.required, Validators.maxLength(150)]],
    descrizione: [''],
    fasiDiLavoro: [''],
    rischiAssociati: [[] as RischioLavorativo[]],
    dpiRichiesti: [[] as DPI[]],
    formazioneRichiesta: [''],
    sorveglianzaSanitaria: [''],
    procedureOperative: [''],
    checklistCollegate: [''],
    documentiCollegati: [''],
  });

  ngOnInit(): void {
    const source = this.mode() === 'edit' ? this.mansione() : null;
    if (source) {
      this.form.patchValue({
        nomeMansione: source.nomeMansione,
        descrizione: source.descrizione || '',
        fasiDiLavoro: source.fasiDiLavoro || '',
        rischiAssociati: source.rischiAssociati || [],
        dpiRichiesti: source.dpiRichiesti || [],
        formazioneRichiesta: source.formazioneRichiesta || '',
        sorveglianzaSanitaria: source.sorveglianzaSanitaria || '',
        procedureOperative: source.procedureOperative || '',
        checklistCollegate: source.checklistCollegate || '',
        documentiCollegati: source.documentiCollegati || '',
      });
    }
  }

  toggleRischio(rischio: RischioLavorativo): void {
    const current = this.form.get('rischiAssociati')?.value as RischioLavorativo[];
    const updated = current.includes(rischio)
      ? current.filter((r) => r !== rischio)
      : [...current, rischio];
    this.form.get('rischiAssociati')?.setValue(updated);
  }

  toggleDPI(dpi: DPI): void {
    const current = this.form.get('dpiRichiesti')?.value as DPI[];
    const updated = current.includes(dpi)
      ? current.filter((d) => d !== dpi)
      : [...current, dpi];
    this.form.get('dpiRichiesti')?.setValue(updated);
  }

  isRischioSelected(rischio: RischioLavorativo): boolean {
    const current = this.form.get('rischiAssociati')?.value as RischioLavorativo[];
    return current?.includes(rischio) || false;
  }

  isDPISelected(dpi: DPI): boolean {
    const current = this.form.get('dpiRichiesti')?.value as DPI[];
    return current?.includes(dpi) || false;
  }

  private buildPayload(): any {
    const raw = this.form.value;
    const data: any = {};
    Object.keys(raw).forEach((key) => {
      const val = (raw as any)[key];
      if (val !== null && val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0)) {
        data[key] = val;
      }
    });
    return data;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    if (this.mode() === 'create') {
      this.mansioneService.create(this.buildPayload() as CreateMansioneRequest).subscribe({
        next: () => {
          this.toast.success('Mansione creata con successo');
          this.saving.set(false);
          this.saved.emit();
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(e.error?.message || 'Errore durante la creazione');
          this.saving.set(false);
        },
      });
    } else if (this.mode() === 'edit' && this.mansione()) {
      this.mansioneService.update(this.mansione()!.id, this.buildPayload() as UpdateMansioneRequest).subscribe({
        next: () => {
          this.toast.success('Mansione aggiornata con successo');
          this.saving.set(false);
          this.saved.emit();
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(e.error?.message || 'Errore durante l\'aggiornamento');
          this.saving.set(false);
        },
      });
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
