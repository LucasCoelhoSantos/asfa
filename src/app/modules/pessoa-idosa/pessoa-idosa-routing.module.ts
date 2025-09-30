import { Routes } from '@angular/router';
import { PessoaIdosaListPage } from './presentation/pages/pessoa-idosa-list/pessoa-idosa-list';
import { PessoaIdosaFormPage } from './presentation/pages/pessoa-idosa-form/pessoa-idosa-form';
import { PessoaIdosaViewPage } from './presentation/pages/pessoa-idosa-view/pessoa-idosa-view';

export const PESSOA_IDOSA_ROUTES: Routes = [
  { path: '', component: PessoaIdosaListPage },
  { path: 'novo', component: PessoaIdosaFormPage },
  { path: ':id/editar', component: PessoaIdosaFormPage },
  { path: ':id/visualizar', component: PessoaIdosaViewPage }
];
