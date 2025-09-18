import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacaoService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const AutenticacaoGuard: CanActivateFn = () => {
  const authService = inject(AutenticacaoService);
  const router = inject(Router);
  return authService.estaLogado$.pipe(
    take(1),
    map(estaLogado => {
      return estaLogado ? true : router.createUrlTree(['/login']);
    })
  );
};