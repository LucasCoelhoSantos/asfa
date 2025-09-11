import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PessoaIdosaService } from './pessoa-idosa.service';
import { PessoaIdosa } from '../../models/pessoa-idosa.model';
import { MainMenuComponent } from '../../shared/components/main-menu/main-menu';
import { NotificationService } from '../../core/services/notification.service';
import { CpfPipe } from '../../shared/pipes/cpf.pipe';
import { TelefonePipe } from '../../shared/pipes/telefone.pipe';
import { CepPipe } from '../../shared/pipes/cep.pipe';
import { RgPipe } from '../../shared/pipes/rg.pipe';
import { loadAndResizeImageAsBase64 } from '../../shared/utils/image.utils';

@Component({
  selector: 'app-pessoa-idosa-view',
  standalone: true,
  imports: [
    CommonModule, 
    MainMenuComponent, 
    CpfPipe, 
    TelefonePipe, 
    CepPipe, 
    RgPipe
  ],
  templateUrl: './pessoa-idosa-view.html'
})
export class PessoaIdosaViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pessoaIdosaService = inject(PessoaIdosaService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  pessoaIdosa$!: Observable<PessoaIdosa | undefined>;
  pessoaIdosa: PessoaIdosa | null = null;
  loading = true;
  error = false;
  private tipoAnexoLabels: Record<number, string> = {
    1: 'Foto de Perfil',
    2: 'CPF',
    3: 'RG',
    4: 'Comprovante de Endereço',
    5: 'Cartão SUS',
    6: 'NIS',
    7: 'Termo de Autorização'
  };
  private tipoAnexoBadgeClass: Record<number, string> = {
    1: 'bg-primary',
    2: 'bg-info',
    3: 'bg-info',
    4: 'bg-secondary',
    5: 'bg-success',
    6: 'bg-warning text-dark',
    7: 'bg-dark'
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarPessoaIdosa(id);
    } else {
      this.notificationService.showError('ID da pessoa idosa não fornecido.');
      this.router.navigate(['/pessoa-idosa']);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarPessoaIdosa(id: string) {
    this.loading = true;
    this.error = false;

    this.pessoaIdosa$ = this.pessoaIdosaService.getById(id);
    
    this.pessoaIdosa$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (pessoa) => {
        if (pessoa) {
          this.pessoaIdosa = pessoa;
        } else {
          this.error = true;
          this.notificationService.showError('Pessoa idosa não encontrada.');
        }
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.notificationService.showError('Erro ao carregar dados da pessoa idosa.');
      }
    });
  }

  editar() {
    if (this.pessoaIdosa) {
      this.router.navigate(['/pessoa-idosa', this.pessoaIdosa.id, 'editar']);
    }
  }

  voltar() {
    this.router.navigate(['/pessoa-idosa']);
  }

  async exportarPdf() {
    if (!this.pessoaIdosa) return;
  
    try {
      const [{ default: jsPDF }, autoTable] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
  
      const doc = new jsPDF();
      const logoBase64 = await this.carregarLogoEConverterParaBase64();
  
      await this.gerarPdfAsync(doc, autoTable, this.pessoaIdosa!, logoBase64);
  
      doc.save(`pessoa-idosa-${this.pessoaIdosa!.nome.replace(/\s+/g, '-')}.pdf`);
      this.notificationService.showSuccess('PDF gerado com sucesso!');
    } catch (error) {
      this.notificationService.showError('Erro ao gerar PDF. Verifique se as dependências estão instaladas ou se há anexos.');
      console.error(error);
    }
  }

  private async gerarPdfAsync(doc: any, autoTable: any, pessoa: PessoaIdosa, logoBase64: string): Promise<void> {
    const logoSize = 26;
    const headerHeight = 35;
    const margin = 20;

    let y = this.gerarCabecalho(doc, logoBase64, pessoa, margin, logoSize, headerHeight);
    y = this.gerarSecaoInformacoesPessoais(doc, pessoa, margin, y);
    y = this.gerarSecaoEndereco(doc, pessoa.endereco, margin, y);
    y = this.gerarSecaoComposicaoFamiliar(doc, pessoa.composicaoFamiliar, margin, y);

    if (pessoa.dependentes && pessoa.dependentes.length > 0) {
      y = this.gerarSecaoDependentes(doc, pessoa.dependentes, margin, y);
    }

    y = this.gerarSecaoObservacoes(doc, pessoa, margin, y);
    await this.gerarSecaoAnexos(doc, pessoa.anexos || [], margin);
    this.gerarRodape(doc);
  }

  private gerarCabecalho(doc: any, logoBase64: string, pessoa: PessoaIdosa, margin: number, logoSize: number, headerHeight: number): number {
    doc.addImage(logoBase64, 'PNG', margin, margin, logoSize, logoSize);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Associação Católica Sagrada Família - Lar Misericordioso', margin + logoSize + 10, margin + 12);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')} - Campo Grande/MS`, margin + logoSize + 10, margin + 22);
    const baseY = margin + headerHeight;
    doc.line(margin, baseY, doc.internal.pageSize.width - margin, baseY);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Ficha de Pessoa Idosa', doc.internal.pageSize.width / 2, baseY + 10, { align: 'center' });
    
    let y = baseY + 20;
    doc.setFontSize(14);
    doc.text(`Nome: ${pessoa.nome}`, margin, y);
    y += 8;
    
    doc.setFontSize(12);
    doc.text(`Data de Cadastro: ${new Date(pessoa.dataCadastro).toLocaleDateString('pt-BR')}`, margin, y);
    y += 6;
    
    doc.text(`Status: ${pessoa.ativo ? 'Ativo' : 'Inativo'}`, margin, y);
    y += 6;
    
    return y;
  }

  private gerarSecaoInformacoesPessoais(doc: any, pessoa: PessoaIdosa, margin: number, yPosition: number): number {
    yPosition += 5;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações Pessoais', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const infoPessoal = [
      `Data de Nascimento: ${new Date(pessoa.dataNascimento).toLocaleDateString('pt-BR')}`,
      `Estado Civil: ${pessoa.estadoCivil || '-'}`,
      `CPF: ${pessoa.cpf || '-'}`,
      `RG: ${pessoa.rg || '-'}`,
      `Órgão Emissor: ${pessoa.orgaoEmissor || '-'}`,
      `Religião: ${pessoa.religiao || '-'}`,
      `Naturalidade: ${pessoa.naturalidade || '-'}`,
      `Telefone: ${pessoa.telefone || '-'}`,
      `Prontuário de Saúde: ${pessoa.prontuarioSaude || '-'}`,
      `Aposentado consegue se manter com sua renda: ${pessoa.aposentadoConsegueSeManterComSuaRenda ? 'Sim' : 'Não'}`,
      `Como complementa: ${pessoa.comoComplementa || '-'}`,
      `Benefício: ${pessoa.beneficio || '-'}`
    ];

    infoPessoal.forEach(info => {
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(info, margin, yPosition);
      yPosition += 6;
    });

    return yPosition;
  }

  private gerarSecaoEndereco(doc: any, endereco: any, margin: number, yPosition: number): number {
    if (yPosition > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = margin;
    }
    else {
      yPosition += 5;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Endereço', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const enderecoInfo = [
      `CEP: ${endereco?.cep || '-'}`,
      `Logradouro: ${endereco?.logradouro || '-'}`,
      `Número: ${endereco?.numero || '-'}`,
      `Bairro: ${endereco?.bairro || '-'}`,
      `Cidade: ${endereco?.cidade || '-'}`,
      `Estado: ${endereco?.estado || '-'}`,
      `Tipo de Moradia: ${endereco?.moradia || '-'}`
    ];

    enderecoInfo.forEach(info => {
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(info, margin, yPosition);
      yPosition += 6;
    });

    return yPosition;
  }

  private gerarSecaoComposicaoFamiliar(doc: any, composicao: any, margin: number, yPosition: number): number {
    if (yPosition > doc.internal.pageSize.height - 60) {
      doc.addPage();
      yPosition = margin;
    }
    else {
      yPosition += 5;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Composição Familiar', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const composicaoInfo = [
      `Alfabetizado: ${composicao?.alfabetizado ? 'Sim' : 'Não'}`,
      `Estuda atualmente: ${composicao?.estudaAtualmente ? 'Sim' : 'Não'}`,
      `Nível/Série atual concluído: ${composicao?.nivelSerieAtualConcluido || '-'}`,
      `Cursos técnicos/formação profissional: ${composicao?.cursosTecnicoFormacaoProfissional || '-'}`,
      `Situação ocupacional: ${composicao?.situacaoOcupacional || '-'}`,
      `Renda: ${composicao?.renda || '-'}`,
      `Aposentado: ${composicao?.aposentado || '-'}`,
      `Benefício: ${composicao?.beneficio || '-'}`,
      `Deficiência: ${composicao?.deficiencia || '-'}`,
      `Problema de saúde: ${composicao?.problemaDeSaude || '-'}`,
      `Faz algum tratamento: ${composicao?.fazAlgumTratamento ? 'Sim' : 'Não'}`,
      `Onde faz tratamento: ${composicao?.fazAlgumTratamentoOnde || '-'}`,
      `Usa medicamento controlado: ${composicao?.usaMedicamentoControlado ? 'Sim' : 'Não'}`,
      `Usa recursos UBS local: ${composicao?.usaRecursosUbsLocal ? 'Sim' : 'Não'}`,
      `Trabalho pastoral ou social: ${composicao?.trabalhoPastoralOuSocial || '-'}`,
      `Atividade na comunidade Sagrada Família: ${composicao?.atividadeNaComunidadeSagradaFamilia || '-'}`,
      `Trabalho voluntário: ${composicao?.trabalhoVoluntario || '-'}`,
      `Onde faz trabalho voluntário: ${composicao?.trabalhoVoluntarioOnde || '-'}`
    ];

    composicaoInfo.forEach(info => {
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(info, margin, yPosition);
      yPosition += 6;
    });

    return yPosition;
  }

  private gerarSecaoDependentes(doc: any, dependentes: any[], margin: number, yPosition: number): number {
    if (yPosition > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = margin;
    }
    else {
      yPosition += 5;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Dependentes', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    dependentes.forEach((dependente, index) => {
      if (yPosition > doc.internal.pageSize.height - 50) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Dependente ${index + 1}: ${dependente.nome}`, margin, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      const dependenteInfo = [
        `Data de Nascimento: ${new Date(dependente.dataNascimento).toLocaleDateString('pt-BR')}`,
        `Parentesco: ${dependente.parentesco || '-'}`,
        `CEINF: ${dependente.ceinf || '-'}`,
        `Bairro CEINF: ${dependente.ceinfBairro || '-'}`,
        `Programa Saúde Pastoral Criança: ${dependente.programaSaudePastoralCrianca || '-'}`,
        `Local do Programa: ${dependente.programaSaudePastoralCriancaLocal || '-'}`,
        `Status: ${dependente.ativo ? 'Ativo' : 'Inativo'}`
      ];

      dependenteInfo.forEach(info => {
        if (yPosition > doc.internal.pageSize.height - 30) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(info, margin + 5, yPosition);
        yPosition += 5;
      });

      yPosition += 5;
    });

    return yPosition;
  }

  private gerarSecaoObservacoes(doc: any, pessoa: PessoaIdosa, margin: number, yPosition: number): number {
    if (yPosition > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = margin;
    }
    else {
      yPosition += 5;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações e Histórico', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (pessoa.observacao) {
      doc.text('Observações:', margin, yPosition);
      yPosition += 6;
      doc.text(pessoa.observacao, margin + 5, yPosition);
      yPosition += 8;
    }

    if (pessoa.historicoFamiliarSocial) {
      doc.text('Histórico Familiar e Social:', margin, yPosition);
      yPosition += 6;
      doc.text(pessoa.historicoFamiliarSocial, margin + 5, yPosition);
    }

    return yPosition;
  }

  private async gerarSecaoAnexos(doc: any, anexos: any[], margin: number): Promise<void> {
    if (!anexos || anexos.length === 0) return;

    doc.addPage();
    for (let index = 0; index < anexos.length; index++) {
      const anexo = anexos[index];
      this.renderAttachmentHeader(doc, anexo, margin);
      await this.renderAttachmentContent(doc, anexo, margin);
      if (index < anexos.length - 1) doc.addPage();
    }
  }

  private gerarRodape(doc: any): void {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`, 
      doc.internal.pageSize.width / 2, 
      pageHeight - 15, 
      { align: 'center' }
    );
  }

  private renderAttachmentFallback(doc: any, anexo: any, x: number, y: number, width: number) {
    const altura = 22;
    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245);
    doc.rect(x, y, width, altura, 'FD');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const nome = anexo?.nomeArquivo || this.extractFileName(anexo?.path) || 'arquivo';
    const texto = anexo?.url ? `${nome} (clique para abrir)` : `${nome} (indisponível)`;
    doc.text(texto, x + 6, y + 13);
    if (anexo?.url) {
      try {
        const textWidth = Math.max(doc.getTextWidth(texto), 60);
        doc.link(x + 6, y + 5, textWidth, 14, { url: anexo.url });
      } catch {}
    }
  }

  private async loadImageAsBase64(url: string): Promise<string> {
    // 1) Tenta via fetch -> blob -> dataURL
    try {
      const resp = await fetch(url, { mode: 'cors' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const blob = await resp.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (_e) {
      // 2) Fallback: carrega via Image com crossOrigin e renderiza em canvas
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            const result = canvas.toDataURL('image/png');
            resolve(result);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = reject;
        const withAlt = url.includes('alt=media') ? url : (url.includes('?') ? `${url}&alt=media` : `${url}?alt=media`);
        img.src = withAlt;
      });
      return dataUrl;
    }
  }

  private async getImageDimensions(dataUrl: string): Promise<{ width: number; height: number; }> {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  private fitWithin(origW: number, origH: number, maxW: number, maxH: number): { width: number; height: number; } {
    const ratio = Math.min(maxW / origW, maxH / origH);
    const width = Math.max(10, Math.floor(origW * ratio));
    const height = Math.max(10, Math.floor(origH * ratio));
    return { width, height };
  }

  private renderAttachmentHeader(doc: any, anexo: any, margin: number): void {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Anexo', margin, margin);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const name = anexo?.nomeArquivo || this.extractFileName(anexo?.path) || 'arquivo';
    const typeLabel = this.getTipoAnexoLabel(anexo?.tipoAnexo);
    doc.text(`${typeLabel} - ${name}`, margin, margin + 8);
  }

  private async renderAttachmentContent(doc: any, anexo: any, margin: number): Promise<void> {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2 - 14;

    const kind = this.inferFileKind(anexo?.nomeArquivo, anexo?.path);
    if (kind === 'image' && anexo?.url) {
      try {
        const dataUrl = await this.loadImageAsBase64(anexo.url);
        const size = await this.getImageDimensions(dataUrl);
        const fit = this.fitWithin(size.width, size.height, maxWidth, maxHeight);
        const x = margin + (maxWidth - fit.width) / 2;
        const y = margin + 14 + (maxHeight - fit.height) / 2;
        doc.addImage(dataUrl, 'PNG', x, y, fit.width, fit.height);
        return;
      } catch {}
    }

    this.renderAttachmentFallback(doc, anexo, margin, margin + 16, maxWidth);
  }

  private extractFileName(path?: string): string | undefined {
    if (!path) return undefined;
    const parts = path.split('/');
    return parts[parts.length - 1] || undefined;
  }

  private carregarLogoEConverterParaBase64(): Promise<string> {
    return loadAndResizeImageAsBase64({ src: '/asfa-logo.png', crossOrigin: 'anonymous', maxWidth: 80, maxHeight: 80, outputType: 'image/png' });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  trackByAnexo = (_: number, anexo: any) => anexo?.path || anexo?.nomeArquivo || _;

  getTipoAnexoLabel(tipo: number | undefined): string {
    if (typeof tipo !== 'number') return 'Documento';
    return this.tipoAnexoLabels[tipo] || 'Documento';
  }

  getTipoAnexoBadgeClass(tipo: number | undefined): string {
    if (typeof tipo !== 'number') return 'bg-secondary';
    return this.tipoAnexoBadgeClass[tipo] || 'bg-secondary';
  }

  inferFileKind(nomeArquivo?: string, path?: string): 'image' | 'pdf' | 'other' {
    const source = (nomeArquivo || path || '').toLowerCase();
    if (!source) return 'other';
    if (source.endsWith('.jpg') || source.endsWith('.jpeg') || source.endsWith('.png') || source.endsWith('.webp')) {
      return 'image';
    }
    if (source.endsWith('.pdf')) return 'pdf';
    return 'other';
  }

  abrirEmNovaAba(url?: string) {
    if (!url) return;
    window.open(url, '_blank');
  }
}
