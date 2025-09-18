import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacaoService } from '../services/auth.service';
import { map, take } from 'rxjs';
import { CargoUsuario } from '../../models/enums';

export const CargoGuard = (cargosPermitidos: CargoUsuario[]): CanActivateFn => {
  return () => {
    const authService = inject(AutenticacaoService);
    const router = inject(Router);
    
    return authService.usuarioComCargo$.pipe(
      take(1),
      map(user => {
        if (!user) {
          return router.createUrlTree(['/login']);
        }
        return cargosPermitidos.includes(user.cargo) ? true : router.createUrlTree(['/pessoa-idosa']);
      })
    );
  };
};