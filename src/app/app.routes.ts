import { Routes } from '@angular/router';
import { AutenticacaoGuard } from './core/guards/auth.guard';
import { CargoGuard } from './core/guards/cargo.guard';
import { CargoUsuario } from './domains/usuario/domain/value-objects/enums';

export const routes: Routes = [
  { 
    path: '',
    loadComponent: () => import('./pages/inicio/inicio').then(m => m.HomeComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  { 
    path: 'ajuda', 
    canActivate: [AutenticacaoGuard],
    loadComponent: () => import('./pages/ajuda/ajuda').then(m => m.AjudaComponent)
  },
  { 
    path: 'perfil', 
    canActivate: [AutenticacaoGuard],
    loadComponent: () => import('./domains/usuario/presentation/pages/usuario-form/usuario-form').then(m => m.UsuarioFormComponent)
  },
  { 
    path: 'usuario', 
    canActivate: [AutenticacaoGuard, CargoGuard([CargoUsuario.Administrador])],
    loadChildren: () => import('./domains/usuario/presentation/usuario-routing.module').then(m => m.USUARIO_ROUTES)
  },
  { 
    path: 'pessoa-idosa', 
    canActivate: [AutenticacaoGuard],
    loadChildren: () => import('./domains/pessoa-idosa/presentation/pessoa-idosa-routing.module').then(m => m.PESSOA_IDOSA_ROUTES)
  },
  { path: '**', redirectTo: '' }
];