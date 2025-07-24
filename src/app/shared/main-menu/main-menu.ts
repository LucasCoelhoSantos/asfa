import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-menu.html',
  styleUrls: ['./main-menu.scss']
})
export class MainMenuComponent {
  menuOpen = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);

  user$ = this.authService.user$;
  userWithRole$ = this.authService.userWithRole$;

  navigate(path: string) {
    this.router.navigate([path]);
    this.menuOpen.set(false);
  }

  toggleMenu() {
    this.menuOpen.update(open => !open);
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}