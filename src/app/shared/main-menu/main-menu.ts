import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-menu.html',
  //styleUrls: ['./main-menu.scss']
})
export class MainMenuComponent {
  menuOpen = signal(false);
  currentRoute = signal('');

  private authService = inject(AuthService);
  private router = inject(Router);

  user$ = this.authService.user$;
  userWithRole$ = this.authService.userWithRole$;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.url);
    });
  }

  navigate(path: string) {
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
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}