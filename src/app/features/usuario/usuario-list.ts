import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../core/services/usuario.service';
import { MainMenuComponent } from '../../shared/main-menu/main-menu';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, MainMenuComponent],
  templateUrl: './usuario-list.html',
  styleUrls: ['./usuario-list.scss']
})
export class UsuarioListComponent {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  usuarios$ = this.usuarioService.getAll();

  editar(id: string) {
    this.router.navigate(['/usuarios', id, 'editar']);
  }

  ativar(id: string) {
    this.usuarioService.setAtivo(id, true);
  }

  desativar(id: string) {
    this.usuarioService.setAtivo(id, false);
  }

  remover(id: string) {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      this.usuarioService.delete(id);
    }
  }
}