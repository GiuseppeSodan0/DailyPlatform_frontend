import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { SorveglianzaSanitariaForm } from '../sorveglianza-sanitaria-form/sorveglianza-sanitaria-form';

@Component({
  selector: 'app-sorveglianza-sanitaria-create-page',
  standalone: true,
  imports: [AppLayout, SorveglianzaSanitariaForm],
  templateUrl: './sorveglianza-sanitaria-create-page.html',
})
export class SorveglianzaSanitariaCreatePage {
  private router = inject(Router);

  onSaved(): void {
    this.router.navigate(['/sorveglianza-sanitaria']);
  }

  onCancelled(): void {
    this.router.navigate(['/sorveglianza-sanitaria']);
  }
}
