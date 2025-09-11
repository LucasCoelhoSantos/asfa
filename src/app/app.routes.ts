import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { 
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
  },
  { 
    path: 'login', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  { 
    path: 'perfil', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/usuario/usuario-form').then(m => m.UsuarioFormComponent)
  },
  { 
    path: 'ajuda', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/ajuda/ajuda').then(m => m.AjudaComponent)
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
  { path: '**', redirectTo: '' }
];