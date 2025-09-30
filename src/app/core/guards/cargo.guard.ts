import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacaoService } from '../services/auth.service';
import { AutorizacaoService } from '../services/autorizacao.service';
import { map, take } from 'rxjs';
import { CargoUsuario } from '../../modules/usuario/domain/value-objects/enums';

export const CargoGuard = (cargosPermitidos: CargoUsuario[]): CanActivateFn => {
  return () => {
    const authService = inject(AutenticacaoService);
    const router = inject(Router);
    const autorizacao = inject(AutorizacaoService);
    
    return authService.usuarioComCargo$.pipe(
      take(1),
      map(user => {
        if (!user) return router.createUrlTree(['/login']);
        if (!user.ativo) return router.createUrlTree(['/perfil']);
        return autorizacao.temAcesso(user, cargosPermitidos) ? true : router.createUrlTree(['/pessoa-idosa']);
      })
    );
  };
};