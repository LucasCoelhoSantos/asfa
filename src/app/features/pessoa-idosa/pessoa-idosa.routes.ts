import { Routes } from '@angular/router';
import { PessoaIdosaListComponent } from './pessoa-idosa-list';
import { PessoaIdosaFormComponent } from './pessoa-idosa-form';
import { PessoaIdosaViewComponent } from './pessoa-idosa-view';

export const PESSOA_IDOSA_ROUTES: Routes = [
  { path: '', component: PessoaIdosaListComponent },
  { path: 'novo', component: PessoaIdosaFormComponent },
  { path: ':id/editar', component: PessoaIdosaFormComponent },
  { path: ':id/visualizar', component: PessoaIdosaViewComponent }
]; 