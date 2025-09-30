import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';

@Component({
  selector: 'app-ajuda',
  standalone: true,
  imports: [CommonModule, MainMenuComponent],
  templateUrl: './ajuda.html'
})
export class AjudaComponent {
  private router = inject(Router);
}
