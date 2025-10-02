import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, take, Observable } from 'rxjs';
import { SessaoService } from '../services/sessao.service';

export const AutenticacaoGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const sessaoService = inject(SessaoService);
  const router = inject(Router);

  return sessaoService.estaLogado$.pipe(
    take(1),
    map(estaLogado => {
      return estaLogado ? true : router.createUrlTree(['/login']);
    })
  );
};