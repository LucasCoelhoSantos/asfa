import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../core/services/usuario.service';
import { MainMenuComponent } from '../../shared/main-menu/main-menu';
import { Router } from '@angular/router';
import { ModalComponent } from '../../shared/modal/modal';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, MainMenuComponent, ModalComponent],
  templateUrl: './usuario-list.html',
  //styleUrls: ['./usuario-list.scss']
})
export class UsuarioListComponent {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private notifications = inject(NotificationService);
  showRemoveModal = false;
  usuarioRemoverId: string | null = null;

  showAtivarModal = false;
  showInativarModal = false;
  usuarioPendenteId: string | null = null;

  usuarios$ = this.usuarioService.getAll();

  navigate(path: string) {
    this.router.navigate([path]);
  }
  
  editar(id: string) {
    this.router.navigate(['/usuario', id, 'editar']);
  }

  solicitarAtivar(id: string) {
    this.usuarioPendenteId = id;
    this.showAtivarModal = true;
  }

  confirmarAtivar() {
    if (this.usuarioPendenteId !== null) {
      this.usuarioService.setAtivo(this.usuarioPendenteId, true);
      this.notifications.showSuccess('Usuário ativado com sucesso.');
    }
    this.cancelarAtivar();
  }

  cancelarAtivar() {
    this.showAtivarModal = false;
    this.usuarioPendenteId = null;
  }

  solicitarInativar(id: string) {
    this.usuarioPendenteId = id;
    this.showInativarModal = true;
  }

  confirmarInativar() {
    if (this.usuarioPendenteId !== null) {
      this.usuarioService.setAtivo(this.usuarioPendenteId, false);
      this.notifications.showSuccess('Usuário inativado com sucesso.');
    }
    this.cancelarInativar();
  }

  cancelarInativar() {
    this.showInativarModal = false;
    this.usuarioPendenteId = null;
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