import { Routes } from '@angular/router';

export const PESSOA_IDOSA_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/pessoa-idosa-list/pessoa-idosa-list').then(m => m.PessoaIdosaListComponent) },
  { path: 'novo', loadComponent: () => import('./pages/pessoa-idosa-form/pessoa-idosa-form').then(m => m.PessoaIdosaFormComponent) },
  { path: ':id/editar', loadComponent: () => import('./pages/pessoa-idosa-form/pessoa-idosa-form').then(m => m.PessoaIdosaFormComponent) },
  { path: ':id/visualizar', loadComponent: () => import('./pages/pessoa-idosa-view/pessoa-idosa-view').then(m => m.PessoaIdosaViewPage) }
];