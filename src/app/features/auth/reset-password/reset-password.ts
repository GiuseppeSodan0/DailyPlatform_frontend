import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

export function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordsMatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  form;
  token: string | null;
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.form = this.fb.nonNullable.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: passwordsMatchValidator });
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading() || !this.token) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.resetPassword({
      token: this.token,
      newPassword: this.form.getRawValue().newPassword,
    }).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: () => this.success.set(true),
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message || 'Errore durante il reset della password');
      },
    });
  }
}
