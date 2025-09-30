import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html'
})
export class HomeComponent {
  private router = inject(Router);

  irParaLogin() {
    this.router.navigate(['/login']);
  }

  baixar() {
    // TO DO
  }
}
