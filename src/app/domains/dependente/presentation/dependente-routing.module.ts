import { Routes } from '@angular/router';

export const DEPENDENTE_ROUTES: Routes = [
  { path: 'novo', loadComponent: () => import('./pages/dependente-form/dependente-form').then(m => m.DependenteFormComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/dependente-form/dependente-form').then(m => m.DependenteFormComponent) }
];