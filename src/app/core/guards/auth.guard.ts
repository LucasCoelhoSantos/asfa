import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      return isLoggedIn ? true : router.createUrlTree(['/login']);
    })
  );
};