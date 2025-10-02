import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { SessaoService } from '../../../core/services/sessao.service';
import { AutenticacaoService } from '../../../core/services/autenticacao.service';
import { UsuarioSessao } from '../../../core/domain/entities/usuario-sessao.entity';
import { CargoUsuario } from '../../../domains/usuario/domain/value-objects/enums';

@Component({
    selector: 'app-main-menu',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './main-menu.html'
})
export class MainMenuComponent {
    private router = inject(Router);
    private sessaoService = inject(SessaoService);
    private autenticacaoService = inject(AutenticacaoService);
    private notificacaoService = inject(NotificacaoService);

    usuario$: Observable<UsuarioSessao | null> = this.sessaoService.usuario$;
    
    readonly CargoUsuario = CargoUsuario;

    sair(): void {
        this.autenticacaoService.sair().subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: () => {
                this.notificacaoService.mostrarErro('Erro ao tentar sair do sistema.');
            }
        });
    }
}