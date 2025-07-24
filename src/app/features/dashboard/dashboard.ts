import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { MainMenuComponent } from "../../shared/main-menu/main-menu";
import { PessoaIdosaListComponent } from '../pessoa-idosa/pessoa-idosa-list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MainMenuComponent, PessoaIdosaListComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Computed observable do usuário autenticado
  user$ = this.authService.user$;

  /**
   * Realiza logout e redireciona para login
   */
  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}