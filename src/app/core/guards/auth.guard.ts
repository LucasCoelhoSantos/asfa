import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { SessaoService } from '../services/sessao.service';

export const AutenticacaoGuard: CanActivateFn = () => {
  const sessaoService = inject(SessaoService);
  const router = inject(Router);

  return sessaoService.estaLogado$.pipe(
    take(1),
    map(estaLogado => {
      return estaLogado ? true : router.createUrlTree(['/login']);
    })
  );
};