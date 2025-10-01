import { Routes } from '@angular/router';
import { AutenticacaoGuard } from './core/guards/auth.guard';
import { CargoGuard } from './core/guards/cargo.guard';
import { CargoUsuario } from './domains/usuario/domain/value-objects/enums';

export const routes: Routes = [
  { 
    path: '',
    loadComponent: () => import('./domains/inicio/presentation/pages/inicio/inicio').then(m => m.HomeComponent)
  },
  { 
    path: 'login', 
    loadChildren: () => import('./domains/autenticacao/presentation/autenticacao-routing.module').then(m => m.AUTH_ROUTES)
  },
  { 
    path: 'perfil', 
    canActivate: [AutenticacaoGuard],
    loadComponent: () => import('./domains/usuario/presentation/pages/usuario-form/usuario-form').then(m => m.UsuarioFormComponent)
  },
  { 
    path: 'ajuda', 
    canActivate: [AutenticacaoGuard],
    loadComponent: () => import('./domains/ajuda/presentation/pages/ajuda/ajuda').then(m => m.AjudaComponent)
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