import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { ModalComponent } from '../../../../../shared';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { UsuarioFacade } from '../../../application/usuario.facade';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { CargoUsuario } from '../../../domain/value-objects/enums';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MainMenuComponent],
  templateUrl: './usuario-list.html'
})
export class UsuarioListComponent implements OnInit {
    private facade = inject(UsuarioFacade);
    private notificacaoService = inject(NotificacaoService);

    usuarios$!: Observable<Usuario[]>;
    readonly CargoUsuario = CargoUsuario;

    ngOnInit(): void {
        this.carregarUsuarios();
    }

    carregarUsuarios(): void {
        this.usuarios$ = this.facade.listar({});
    }

    async inativar(id: string): Promise<void> {
        if (confirm('Tem certeza que deseja inativar este usuário?')) {
        try {
            await this.facade.inativar(id);
            this.notificacaoService.mostrarSucesso('Usuário inativado com sucesso.');
            this.carregarUsuarios();
        } catch (error) {
            this.notificacaoService.mostrarErro('Falha ao inativar o usuário.');
        }
        }
    }

    async ativar(id: string): Promise<void> {
        if (confirm('Tem certeza que deseja ativar este usuário?')) {
        try {
            await this.facade.ativar(id);
            this.notificacaoService.mostrarSucesso('Usuário ativado com sucesso.');
            this.carregarUsuarios();
        } catch (error) {
            this.notificacaoService.mostrarErro('Falha ao ativar o usuário.');
        }
        }
    }
}