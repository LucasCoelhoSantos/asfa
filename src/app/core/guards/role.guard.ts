import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';
import { UsuarioRole } from '../../models/usuario.model';

export const RoleGuard = (allowedRoles: UsuarioRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    return authService.userWithRole$.pipe(
      take(1),
      map(user => {
        if (!user) {
          router.navigate(['/login']);
          return false;
        }
        
        if (allowedRoles.includes(user.role)) {
          return true;
        } else {
          // Redireciona para página de acesso negado ou menu principal
          router.navigate(['/pessoa-idosa']);
          return false;
        }
      })
    );
  };
}; 