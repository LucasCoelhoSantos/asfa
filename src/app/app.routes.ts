import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login';
import { UsuarioListComponent } from './features/usuario/usuario-list';
import { UsuarioFormComponent } from './features/usuario/usuario-form';
import { DashboardComponent } from './features/dashboard/dashboard';
import { PessoaIdosaListComponent } from './features/pessoa-idosa/pessoa-idosa-list';
import { PessoaIdosaFormComponent } from './features/pessoa-idosa/pessoa-idosa-form';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'usuario', component: UsuarioListComponent, canActivate: [AuthGuard] },
  { path: 'usuario/novo', component: UsuarioFormComponent, canActivate: [AuthGuard] },
  { path: 'usuario/:id/editar', component: UsuarioFormComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'pessoa-idosa', component: PessoaIdosaListComponent, canActivate: [AuthGuard] },
  { path: 'pessoa-idosa/novo', component: PessoaIdosaFormComponent, canActivate: [AuthGuard] },
  { path: 'pessoa-idosa/:id/editar', component: PessoaIdosaFormComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];