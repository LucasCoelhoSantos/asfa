import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AutenticacaoFacade } from '../../../domains/autenticacao/application/autenticacao.facade';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-menu.html'
})
export class MainMenuComponent {
  menuOpen = signal(false);
  currentRoute = signal('');

  private authFacade = inject(AutenticacaoFacade);
  private router = inject(Router);

  user$ = this.authFacade.usuario$;
  userWithRole$ = this.authFacade.usuarioComCargo$;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.url);
    });
  }

  navegar(path: string) {
    this.router.navigate([path]);
    this.menuOpen.set(false);
  }

  toggleMenu() {
    this.menuOpen.update(open => !open);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  isActiveRoute(path: string): boolean {
    return this.currentRoute() === path;
  }

  getUserInitials(email: string | null): string {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  }

  getUserDisplayName(email: string | null): string {
    if (!email) return 'Usuário';
    const name = email.split('@')[0];
    return name.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  }

  logout() {
    this.authFacade.sair().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}