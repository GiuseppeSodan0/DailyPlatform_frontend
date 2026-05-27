import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { MansioneForm } from '../mansione-form/mansione-form';

@Component({
  selector: 'app-mansione-create-page',
  standalone: true,
  imports: [AppLayout, MansioneForm],
  templateUrl: './mansione-create-page.html',
})
export class MansioneCreatePage {
  private router = inject(Router);

  onSaved(): void {
    this.router.navigate(['/mansione']);
  }

  onCancelled(): void {
    this.router.navigate(['/mansione']);
  }
}
