import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../core/services/usuario.service';
import { MainMenuComponent } from '../../shared/main-menu/main-menu';
import { Router } from '@angular/router';
import { ModalComponent } from '../../shared/modal/modal';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, MainMenuComponent, ModalComponent],
  templateUrl: './usuario-list.html',
  styleUrls: ['./usuario-list.scss']
})
export class UsuarioListComponent {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  showRemoveModal = false;
  usuarioRemoverId: string | null = null;

  usuarios$ = this.usuarioService.getAll();

  navigate(path: string) {
    this.router.navigate([path]);
  }
  
  editar(id: string) {
    this.router.navigate(['/usuario', id, 'editar']);
  }

  ativar(id: string) {
    this.usuarioService.setAtivo(id, true);
  }

  desativar(id: string) {
    this.usuarioService.setAtivo(id, false);
  }

  confirmarRemover(id: string) {
    this.usuarioRemoverId = id;
    this.showRemoveModal = true;
  }

  remover() {
    if (this.usuarioRemoverId !== null) {
      this.usuarioService.delete(this.usuarioRemoverId);
    }
    this.showRemoveModal = false;
    this.usuarioRemoverId = null;
  }

  cancelarRemover() {
    this.showRemoveModal = false;
    this.usuarioRemoverId = null;
  }

  getUserInitials(email: string): string {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  }
}