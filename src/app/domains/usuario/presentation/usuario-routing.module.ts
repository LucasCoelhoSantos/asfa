import { Routes } from '@angular/router';

export const USUARIO_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/usuario-list/usuario-list').then(m => m.UsuarioListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/usuario-form/usuario-form').then(m => m.UsuarioFormComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/usuario-form/usuario-form').then(m => m.UsuarioFormComponent) }
];