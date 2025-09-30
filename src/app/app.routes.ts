import { Routes } from '@angular/router';
import { AutenticacaoGuard } from './core/guards/auth.guard';
import { CargoGuard } from './core/guards/cargo.guard';
import { CargoUsuario } from './modules/usuario/domain/value-objects/enums';

export const routes: Routes = [
  { 
    path: '',
    loadComponent: () => import('./modules/inicio/presentation/pages/inicio/inicio').then(m => m.HomeComponent)
  },
  { 
    path: 'login', 
    loadChildren: () => import('./modules/autenticacao/autenticacao-routing.module').then(m => m.AUTH_ROUTES)
  },
  { 
    path: 'perfil', 
    canActivate: [AutenticacaoGuard],
    loadComponent: () => import('./modules/usuario/presentation/pages/usuario-form/usuario-form').then(m => m.UsuarioFormComponent)
  },
  { 
    path: 'ajuda', 
    canActivate: [AutenticacaoGuard],
    loadComponent: () => import('./modules/ajuda/presentation/pages/ajuda/ajuda').then(m => m.AjudaComponent)
  },
  { 
    path: 'usuario', 
    canActivate: [AutenticacaoGuard, CargoGuard([CargoUsuario.Administrador])],
    loadChildren: () => import('./modules/usuario/usuario-routing.module').then(m => m.USUARIO_ROUTES)
  },
  { 
    path: 'pessoa-idosa', 
    canActivate: [AutenticacaoGuard],
    loadChildren: () => import('./modules/pessoa-idosa/pessoa-idosa-routing.module').then(m => m.PESSOA_IDOSA_ROUTES)
  },
  { path: '**', redirectTo: '' }
];