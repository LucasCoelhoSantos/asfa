import { Routes } from '@angular/router';
import { UsuarioListComponent } from './usuario-list';
import { UsuarioFormComponent } from './usuario-form';

export const USUARIO_ROUTES: Routes = [
  { path: '', component: UsuarioListComponent },
  { path: 'novo', component: UsuarioFormComponent },
  { path: ':id/editar', component: UsuarioFormComponent }
]; 