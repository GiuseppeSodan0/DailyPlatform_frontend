import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { CompanyForm } from '../company-form/company-form';

@Component({
  selector: 'app-company-create-page',
  standalone: true,
  imports: [AppLayout, CompanyForm],
  templateUrl: './company-create-page.html',
})
export class CompanyCreatePage {
  private router = inject(Router);

  onSaved(companyId: number): void {
    this.router.navigate(['/sedi-operative', companyId, 'new']);
  }

  onCancelled(): void {
    this.router.navigate(['/companies']);
  }
}
