import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { PessoaIdosaFacade } from '../../../application/pessoa-idosa.facade';
import { PessoaIdosaListFilters, PessoaIdosaListPage } from '../../../domain/repositories/pessoa-idosa.repository';
import { CpfPipe } from '../../../../../shared';
import { TelefonePipe } from '../../../../../shared';

import { PessoaIdosa } from '../../../domain/entities/pessoa-idosa.entity';
import { Router } from '@angular/router';
import { PdfService } from '../../../../../shared/services/pdf.service';
import { 
    ESTADO_CIVIL_OPCOES, 
    MORADIAS_OPCOES,
    BENEFICIOS_OPCOES,
    RENDAS_OPCOES,
    SITUACOES_OCUPACIONAIS_OPCOES,
    APOSENTADO_OPCOES,
    DEFICIENCIA_OPCOES,
    ESCOLARIDADE_OPCOES,
    TIPO_FORMACAO_PROFISSIONAL_OPCOES,
    PROBLEMA_DE_SAUDE_OPCOES
} from '../../../../../shared/constants/app.constants';
const PAGE_SIZE_OPTIONS = [20, 50, 100, -1];

@Component({
    selector: 'app-pessoa-idosa-list',
    standalone: true,
    imports: [CommonModule, RouterModule, MainMenuComponent, CpfPipe, TelefonePipe],
    templateUrl: './pessoa-idosa-list.html'
})
export class PessoaIdosaListComponent implements OnInit {
    private facade = inject(PessoaIdosaFacade);
    private notificacaoService = inject(NotificacaoService);
    page$: Observable<PessoaIdosaListPage> = this.facade.page$;
    private readonly TAMANHO_PAGINA = 10;

    private pdfService = inject(PdfService);

    ngOnInit(): void {
        this.carregarProximaPagina();
    }

    carregarProximaPagina(cursor: unknown | null = null): void {
        this.facade.carregarPagina(this.TAMANHO_PAGINA, cursor, {});
    }

    async ativar(id: string): Promise<void> {
        if (confirm('Tem certeza que deseja ativar este registro?')) {
            try {
                await this.facade.ativar(id);
                this.notificacaoService.mostrarSucesso('Registro ativado com sucesso.');
                this.carregarProximaPagina();
            } catch (erro) {
                this.notificacaoService.mostrarErro('Falha ao ativar o registro.');
            }
        }
    }

    async inativar(id: string): Promise<void> {
        if (confirm('Tem certeza que deseja inativar este registro?')) {
            try {
                await this.facade.inativar(id);
                this.notificacaoService.mostrarSucesso('Registro inativado com sucesso.');
                this.carregarProximaPagina();
            } catch (erro) {
                this.notificacaoService.mostrarErro('Falha ao inativar o registro.');
            }
        }
    }
}