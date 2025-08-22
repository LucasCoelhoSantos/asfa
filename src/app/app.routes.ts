import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  { 
    path: 'usuario', 
    canActivate: [AuthGuard, RoleGuard(['admin'])],
    loadChildren: () => import('./features/usuario/usuario.routes').then(m => m.USUARIO_ROUTES)
  },
  { 
    path: 'pessoa-idosa', 
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/pessoa-idosa/pessoa-idosa.routes').then(m => m.PESSOA_IDOSA_ROUTES)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];