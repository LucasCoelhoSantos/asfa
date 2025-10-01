import { Routes } from '@angular/router';
import { UsuarioListComponent } from './pages/usuario-list/usuario-list';
import { UsuarioFormComponent } from './pages/usuario-form/usuario-form';

export const USUARIO_ROUTES: Routes = [
  { path: '', component: UsuarioListComponent },
  { path: 'novo', component: UsuarioFormComponent },
  { path: ':id/editar', component: UsuarioFormComponent }
];
