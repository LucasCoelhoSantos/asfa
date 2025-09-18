import { Routes } from '@angular/router';
import { AutenticacaoGuard } from './core/guards/auth.guard';
import { CargoGuard } from './core/guards/cargo.guard';
import { CargoUsuario } from './models/enums';

export const routes: Routes = [
  { 
    path: '',
    loadComponent: () => import('./features/inicio/inicio').then(m => m.HomeComponent)
  },
  { 
    path: 'login', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  { 
    path: 'perfil', 
    canActivate: [AutenticacaoGuard],
    loadComponent: () => import('./features/usuario/usuario-form').then(m => m.UsuarioFormComponent)
  },
  { 
    path: 'ajuda', 
    canActivate: [AutenticacaoGuard],
    loadComponent: () => import('./features/ajuda/ajuda').then(m => m.AjudaComponent)
  },
  { 
    path: 'usuario', 
    canActivate: [AutenticacaoGuard, CargoGuard([CargoUsuario.Administrador])],
    loadChildren: () => import('./features/usuario/usuario.routes').then(m => m.USUARIO_ROUTES)
  },
  { 
    path: 'pessoa-idosa', 
    canActivate: [AutenticacaoGuard],
    loadChildren: () => import('./features/pessoa-idosa/pessoa-idosa.routes').then(m => m.PESSOA_IDOSA_ROUTES)
  },
  { path: '**', redirectTo: '' }
];