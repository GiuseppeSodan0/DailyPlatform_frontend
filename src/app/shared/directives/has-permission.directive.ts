import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private auth = inject(AuthService);

  private permission = '';
  private elseRef: TemplateRef<unknown> | null = null;

  @Input() set appHasPermission(value: string) {
    this.permission = value;
  }

  @Input() set appHasPermissionElse(value: TemplateRef<unknown>) {
    this.elseRef = value;
  }

  ngOnInit(): void {
    if (this.auth.hasPermission(this.permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.elseRef) {
      this.viewContainer.createEmbeddedView(this.elseRef);
    }
  }
}

@Directive({
  selector: '[appHasAnyPermission]',
  standalone: true,
})
export class HasAnyPermissionDirective implements OnInit {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private auth = inject(AuthService);

  private permissions: string[] = [];

  @Input() set appHasAnyPermission(value: string[]) {
    this.permissions = value;
  }

  ngOnInit(): void {
    if (this.auth.hasAnyPermission(this.permissions)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
