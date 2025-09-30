import { Routes } from '@angular/router';
import { UsuarioListComponent } from './presentation/pages/usuario-list/usuario-list';
import { UsuarioFormComponent } from './presentation/pages/usuario-form/usuario-form';

export const USUARIO_ROUTES: Routes = [
  { path: '', component: UsuarioListComponent },
  { path: 'novo', component: UsuarioFormComponent },
  { path: ':id/editar', component: UsuarioFormComponent }
];
