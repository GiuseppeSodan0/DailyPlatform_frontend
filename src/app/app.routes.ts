import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['PAGE_DASHBOARD_VIEW'] },
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'users',
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['PAGE_USER_VIEW'] },
    loadComponent: () => import('./features/users/users').then((m) => m.Users),
  },
  {
    path: 'roles/:id/permissions',
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['ACTION_ASSIGN_PERMISSION'] },
    loadComponent: () => import('./features/role-permissions/role-permissions').then((m) => m.RolePermissions),
  },
  {
    path: 'roles',
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['PAGE_ROLE_VIEW'] },
    loadComponent: () => import('./features/roles/roles').then((m) => m.Roles),
  },
  {
    path: 'companies',
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['PAGE_COMPANY_VIEW'] },
    loadComponent: () => import('./features/companies/companies').then((m) => m.Companies),
  },
  {
    path: 'profile',
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['SECTION_PROFILE'] },
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./features/forbidden/forbidden').then((m) => m.Forbidden),
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
