import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { FormazioneForm } from '../formazione-form/formazione-form';

@Component({
  selector: 'app-formazione-create-page',
  standalone: true,
  imports: [AppLayout, FormazioneForm],
  templateUrl: './formazione-create-page.html',
})
export class FormazioneCreatePage {
  private router = inject(Router);

  onSaved(): void {
    this.router.navigate(['/formazione']);
  }

  onCancelled(): void {
    this.router.navigate(['/formazione']);
  }
}
