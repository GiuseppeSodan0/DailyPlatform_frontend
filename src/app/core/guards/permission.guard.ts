import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const requiredPermissions = route.data?.['permissions'] as string[] | undefined;
  const mode = (route.data?.['permissionMode'] as 'all' | 'any') ?? 'any';

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  const has =
    mode === 'all'
      ? auth.hasAllPermissions(requiredPermissions)
      : auth.hasAnyPermission(requiredPermissions);

  return has ? true : router.createUrlTree(['/forbidden']);
};
