import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../core/services/usuario.service';
import { MainMenuComponent } from '../../shared/components/main-menu/main-menu';
import { Router } from '@angular/router';
import { ModalComponent } from '../../shared/components/modal/modal';
import { NotificacaoService } from '../../core/services/notificacao.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, MainMenuComponent, ModalComponent],
  templateUrl: './usuario-list.html'
})
export class UsuarioListComponent {
  private usuarioService = inject(UsuarioService);
  private notificacaoService = inject(NotificacaoService);
  private router = inject(Router);
  mostrarModalRemover = false;
  usuarioRemoverId: string | null = null;
  mostrarModalAtivar = false;
  usuarioPendenteId: string | null = null;
  modalAcao: 'ativar' | 'inativar' | null = null;

  usuarios$ = this.usuarioService.obterTodos();

  navegar(path: string) {
    this.router.navigate([path]);
  }
  
  editar(id: string) {
    this.router.navigate(['/usuario', id, 'editar']);
  }

  solicitarAlterarAtivo(id: string, ativar: boolean) {
    this.usuarioPendenteId = id;
    this.modalAcao = ativar ? 'ativar' : 'inativar';
    this.mostrarModalAtivar = true;
  }

  confirmarAlterarAtivo() {
    if (this.usuarioPendenteId && this.modalAcao) {
      const ativar = this.modalAcao === 'ativar';
      this.usuarioService.setarAtivo(this.usuarioPendenteId, ativar);
      this.notificacaoService.mostrarSucesso(
        `Usuário ${ativar ? 'ativado' : 'inativado'} com sucesso.`
      );
    }
    this.cancelarAlterarAtivo();
  }

  cancelarAlterarAtivo() {
    this.mostrarModalAtivar = false;
    this.modalAcao = null;
    this.usuarioPendenteId = null;
  }

  obterIniciaisDoUsuario(email: string): string {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  }

  get tituloModal() {
    return this.modalAcao === 'ativar' ? 'Ativar' : 'Inativar';
  }

  get mensagemModal() {
    return this.modalAcao === 'ativar' ? 'ativar' : 'inativar';
  }
}