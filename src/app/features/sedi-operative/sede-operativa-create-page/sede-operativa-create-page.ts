import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppLayout } from '../../../layout/app-layout/app-layout';
import { SedeOperativaForm } from '../sede-operativa-form/sede-operativa-form';

@Component({
  selector: 'app-sede-operativa-create-page',
  standalone: true,
  imports: [AppLayout, SedeOperativaForm],
  templateUrl: './sede-operativa-create-page.html',
})
export class SedeOperativaCreatePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  companyId = 0;

  ngOnInit(): void {
    this.companyId = Number(this.route.snapshot.paramMap.get('companyId'));
  }

  onSaved(): void {
    this.router.navigate(['/sedi-operative']);
  }

  onCancelled(): void {
    this.router.navigate(['/sedi-operative']);
  }
}
