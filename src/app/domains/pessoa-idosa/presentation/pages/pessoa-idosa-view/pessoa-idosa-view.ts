import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PessoaIdosaFacade } from '../../../application/pessoa-idosa.facade';
import { PessoaIdosa } from '../../../domain/entities/pessoa-idosa.entity';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { PdfService } from '../../../../../shared/services/pdf.service';
import { CATEGORIAS_ANEXO } from '../../../../../shared/constants/app.constants';

@Component({
  selector: 'app-pessoa-idosa-view',
  standalone: true,
  imports: [CommonModule, MainMenuComponent],
  templateUrl: './pessoa-idosa-view.html'
})
export class PessoaIdosaViewPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pessoaIdosaFacade = inject(PessoaIdosaFacade);
  private notificationService = inject(NotificacaoService);
  private readonly destroy$ = new Subject<void>();
  private pdfService = inject(PdfService);

  pessoaIdosa$!: Observable<PessoaIdosa | undefined>;
  pessoaIdosa: PessoaIdosa | null = null;
  loading = true;
  error = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarPessoaIdosa(id);
    } else {
      this.notificationService.mostrarErro('ID da pessoa idosa não fornecido.');
      this.router.navigate(['/pessoa-idosa']);
    }
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  private carregarPessoaIdosa(id: string) {
    this.loading = true; this.error = false;
    this.pessoaIdosa$ = this.pessoaIdosaFacade.obterPorId(id);
    this.pessoaIdosa$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (pessoa) => { if (pessoa) { this.pessoaIdosa = pessoa; } else { this.error = true; this.notificationService.mostrarErro('Pessoa idosa não encontrada.'); } this.loading = false; },
      error: () => { this.error = true; this.loading = false; this.notificationService.mostrarErro('Erro ao carregar dados da pessoa idosa.'); }
    });
  }
  editar() { if (this.pessoaIdosa) { this.router.navigate(['/pessoa-idosa', this.pessoaIdosa.id, 'editar']); } }
  voltar() { this.router.navigate(['/pessoa-idosa']); }
  async exportarPdf() { if (!this.pessoaIdosa) return; try { await this.pdfService.gerarPdfPessoa(this.pessoaIdosa!); this.notificationService.mostrarSucesso('PDF gerado com sucesso!'); } catch (error) { this.notificationService.mostrarErro('Erro ao gerar PDF.'); } }
  trackByAnexo = (_: number, anexo: any) => anexo?.path || anexo?.nomeArquivo || _;
  obterCategoriaAnexoLabel(categoria: number | undefined): string { if (typeof categoria !== 'number') return 'Documento'; const encontrada = CATEGORIAS_ANEXO.find(c => c.categoria === categoria); return encontrada?.label || 'Documento'; }
  obterCategoriaAnexoBadgeClass(categoria: number | undefined): string { if (typeof categoria !== 'number') return 'bg-secondary'; const encontrada = CATEGORIAS_ANEXO.find(c => c.categoria === categoria); return encontrada?.class || 'bg-secondary'; }
  inferirTipoArquivo(nomeArquivo?: string, caminho?: string): 'image' | 'pdf' | 'other' { const origem = (nomeArquivo || caminho || '').toLowerCase(); if (!origem) return 'other'; if (origem.endsWith('.jpg') || origem.endsWith('.jpeg') || origem.endsWith('.png') || origem.endsWith('.webp')) { return 'image'; } if (origem.endsWith('.pdf')) return 'pdf'; return 'other'; }
  abrirEmNovaAba(url?: string) { if (!url) return; window.open(url, '_blank'); }
}