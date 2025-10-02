import { Routes } from '@angular/router';
import { PessoaIdosaListComponent } from './pages/pessoa-idosa-list/pessoa-idosa-list';
import { PessoaIdosaFormComponent } from './pages/pessoa-idosa-form/pessoa-idosa-form';
import { PessoaIdosaViewPage } from './pages/pessoa-idosa-view/pessoa-idosa-view';

export const PESSOA_IDOSA_ROUTES: Routes = [
  { path: '', component: PessoaIdosaListComponent },
  { path: 'novo', component: PessoaIdosaFormComponent },
  { path: ':id/editar', component: PessoaIdosaFormComponent },
  { path: ':id/visualizar', component: PessoaIdosaViewPage }
];
