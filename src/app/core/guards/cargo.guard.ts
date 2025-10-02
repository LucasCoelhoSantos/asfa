import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, take, Observable } from 'rxjs';
import { SessaoService } from '../services/sessao.service';
import { CargoUsuario } from '../../domains/usuario/domain/value-objects/enums';

export const CargoGuard = (cargosPermitidos: CargoUsuario[]): CanActivateFn => {
  return (): Observable<boolean | UrlTree> => {
    const sessaoService = inject(SessaoService);
    const router = inject(Router);
    
    return sessaoService.temCargo(cargosPermitidos).pipe(
      take(1),
      map(temPermissao => {
        return temPermissao ? true : router.createUrlTree(['/']);
      })
    );
  };
};