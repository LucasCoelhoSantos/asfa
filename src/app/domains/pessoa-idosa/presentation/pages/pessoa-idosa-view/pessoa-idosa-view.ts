import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, switchMap, firstValueFrom, filter, take } from 'rxjs';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { PessoaIdosaFacade } from '../../../application/pessoa-idosa.facade';
import { PessoaIdosa } from '../../../domain/entities/pessoa-idosa.entity';
import { CpfPipe } from '../../../../../shared/pipes/cpf.pipe';
import { TelefonePipe } from '../../../../../shared/pipes/telefone.pipe';
import { RgPipe } from '../../../../../shared/pipes/rg.pipe';
import { CepPipe } from '../../../../../shared/pipes/cep.pipe';
import { CATEGORIA_ANEXO_INFO } from '../../../../../shared/constants/app.constants';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { ImageThumbnailComponent } from '../../../../../shared/components/image-thumbnail/image-thumbnail';

@Component({
  selector: 'app-pessoa-idosa-view',
  standalone: true,
  imports: [CommonModule, RouterModule, MainMenuComponent, CpfPipe, TelefonePipe, RgPipe, CepPipe, ImageThumbnailComponent],
  templateUrl: './pessoa-idosa-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PessoaIdosaViewPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private facade = inject(PessoaIdosaFacade);
  private location = inject(Location);
  private notificacaoService = inject(NotificacaoService);

  pessoaIdosa$!: Observable<PessoaIdosa | undefined>;
  readonly categoriasAnexoInfo = CATEGORIA_ANEXO_INFO;

  ngOnInit(): void {
    this.pessoaIdosa$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.facade.obterPorId(id);
        }
        this.notificacaoService.mostrarErro('ID da pessoa idosa não encontrado.')
        this.router.navigate(['/pessoa-idosa'])
        return [];
      })
    );
  }

  editar(pessoaIdosaId: string): void {
    this.router.navigate(['/pessoa-idosa', pessoaIdosaId, 'editar']);
  }

  async exportarPdf() {
    try {
      const pessoa = await firstValueFrom(this.pessoaIdosa$.pipe(filter(Boolean), take(1)));
      this.facade.gerarRelatorioPdf(pessoa as PessoaIdosa);
    } catch (erro) {
      this.notificacaoService.mostrarErro('Não foi possível obter os dados da pessoa idosa para gerar o relatório.');
    }
  }

  getAnexoUrl(pessoa: PessoaIdosa, categoria: number): string | undefined {
    return pessoa.anexos.find(anexo => anexo.categoria === categoria)?.url;
  }

  voltar(): void {
    this.location.back();
  }

  trackByDependente(index: number, dependente: any): string | number {
    return dependente?.id ?? index;
  }

  trackByAnexo(index: number, anexo: any): string | number {
    return anexo?.url ?? `${anexo?.categoria}-${index}`;
  }
}