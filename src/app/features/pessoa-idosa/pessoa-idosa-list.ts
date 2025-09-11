import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoaIdosaService, FiltrosPessoaIdosa, PaginacaoResult } from './pessoa-idosa.service';
import { PessoaIdosa } from '../../models/pessoa-idosa.model';
import { Router } from '@angular/router';
import { MainMenuComponent } from '../../shared/components/main-menu/main-menu';
import { TableSkeletonComponent } from '../../shared/components/skeleton/table-skeleton.component';
import { ModalComponent } from '../../shared/components/modal/modal';
import { NotificationService } from '../../core/services/notification.service';
import { CpfPipe } from '../../shared/pipes/cpf.pipe';
import { TelefonePipe } from '../../shared/pipes/telefone.pipe';
import { CepPipe } from '../../shared/pipes/cep.pipe';
import { RgPipe } from '../../shared/pipes/rg.pipe';
import { loadAndResizeImageAsBase64 } from '../../shared/utils/image.utils';
import { MaskDirective } from '../../shared/directives/mask.directive';
import { Observable, Subject, BehaviorSubject, takeUntil } from 'rxjs';
import { 
  ESTADOS_CIVIS, 
  MORADIAS_OPTIONS,
  BENEFICIOS_OPTIONS,
  RENDAS_OPTIONS,
  SITUACOES_OCUPACIONAIS_OPTIONS,
  APOSENTADOS_OPTIONS,
  DEFICIENCIAS_OPTIONS,
  NIVEIS_SERIE_OPTIONS,
  CURSOS_FORMACAO_OPTIONS,
  PROBLEMAS_SAUDE_OPTIONS
} from '../../shared/constants/app.constants';
const PAGE_SIZE_OPTIONS = [20, 50, 100, -1];

@Component({
  selector: 'app-pessoa-idosa-list',
  standalone: true,
  imports: [CommonModule, MainMenuComponent, TableSkeletonComponent, CpfPipe, TelefonePipe, CepPipe, RgPipe, MaskDirective, ModalComponent],
  templateUrl: './pessoa-idosa-list.html'
})
export class PessoaIdosaListComponent implements OnInit, OnDestroy {
  private pessoaIdosaService = inject(PessoaIdosaService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  pessoas$!: Observable<PaginacaoResult>;
  loading$ = new BehaviorSubject<boolean>(false);

  filtro: FiltrosPessoaIdosa = {
    nome: '',
    dataNascimento: '',
    estadoCivil: '',
    cpf: '',
    rg: '',
    cep: ''
  };

  pageSizeOptions = PAGE_SIZE_OPTIONS;
  pageSize = 20;
  pageIndex = 0;
  lastDoc: any = null;
  total = 0;
  hasMore = false;

  estadosCivis = ESTADOS_CIVIS;
  
  beneficios = BENEFICIOS_OPTIONS;
  rendas = RENDAS_OPTIONS;
  situacoesOcupacionais = SITUACOES_OCUPACIONAIS_OPTIONS;
  aposentados = APOSENTADOS_OPTIONS;
  deficiencias = DEFICIENCIAS_OPTIONS;
  niveisSerie = NIVEIS_SERIE_OPTIONS;
  cursosFormacao = CURSOS_FORMACAO_OPTIONS;
  problemasSaude = PROBLEMAS_SAUDE_OPTIONS;
  moradias = MORADIAS_OPTIONS;

  filtroAvancado = {
    alfabetizado: false,
    estudaAtualmente: false,
    nivelSerie: '',
    cursoFormacao: '',
    beneficio: '',
    situacaoOcupacional: '',
    problemaDeSaude: '',
    aposentado: '',
    moradia: '',
    deficiencia: '',
    moradias: ''
  };

  showInativarModal = false;
  showAtivarModal = false;
  private idPendenteAcao: string | null = null;
  private acaoPendente: 'ativar' | 'inativar' | null = null;

  ngOnInit() {
    this.carregarDadosIniciais();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarDadosIniciais() {
    this.loading$.next(true);
    this.pessoaIdosaService.aplicarFiltros({});
    this.pessoas$ = this.pessoaIdosaService.pessoas$!;
    
    this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.total = result.total;
      this.hasMore = result.hasMore;
      this.lastDoc = result.lastDoc;
      this.loading$.next(false);
      this.cdr.detectChanges();
    });
  }

  buscar() {
    this.loading$.next(true);
    this.pageIndex = 0;
    this.lastDoc = null;
    
    this.pessoaIdosaService.aplicarFiltros(this.filtro);
    this.pessoas$ = this.pessoaIdosaService.pessoas$!;
    
    this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.total = result.total;
      this.hasMore = result.hasMore;
      this.lastDoc = result.lastDoc;
      this.loading$.next(false);
      this.cdr.detectChanges();
    });
  }

  limparFiltros() {
    this.filtro = {
      nome: '',
      dataNascimento: '',
      estadoCivil: '',
      cpf: '',
      rg: '',
      cep: ''
    };
    
    this.filtroAvancado = {
      alfabetizado: false,
      estudaAtualmente: false,
      nivelSerie: '',
      cursoFormacao: '',
      beneficio: '',
      situacaoOcupacional: '',
      problemaDeSaude: '',
      aposentado: '',
      moradia: '',
      deficiencia: '',
      moradias: ''
    };
    
    this.buscar();
  }

  setFiltro(campo: keyof FiltrosPessoaIdosa, valor: string | boolean | undefined) {
    if (campo === 'ativo') {
      this.filtro.ativo = valor === 'ativo' ? true : valor === 'inativo' ? false : undefined;
    } else {
      (this.filtro as any)[campo] = valor;
    }
  }
  
  setPageSize(size: number) { 
    this.pageSize = size; 
    this.buscar();
  }

  setPageIndex(index: number) {
    if (index < 0) return;
    this.pageIndex = index;
    this.loading$.next(true);
    this.pessoaIdosaService.setPaginacao(this.pageSize, this.lastDoc);
  }

  editar(id: string) {
    this.router.navigate(['/pessoa-idosa', id, 'editar']);
  }

  visualizar(id: string) {
    this.router.navigate(['/pessoa-idosa', id, 'visualizar']);
  }

  openInativarConfirm(id: string) {
    this.idPendenteAcao = id;
    this.acaoPendente = 'inativar';
    this.showInativarModal = true;
  }

  cancelInativar() {
    this.showInativarModal = false;
    this.idPendenteAcao = null;
    this.acaoPendente = null;
  }

  confirmInativar() {
    if (!this.idPendenteAcao) return;
    this.pessoaIdosaService.inativar(this.idPendenteAcao).subscribe({
      next: () => {
        this.notificationService.showSuccess('Registro inativado com sucesso.');
        this.buscar();
      },
      error: () => {
        this.notificationService.showError('Erro ao inativar registro.');
      }
    });
    this.cancelInativar();
  }

  openAtivarConfirm(id: string) {
    this.idPendenteAcao = id;
    this.acaoPendente = 'ativar';
    this.showAtivarModal = true;
  }

  cancelAtivar() {
    this.showAtivarModal = false;
    this.idPendenteAcao = null;
    this.acaoPendente = null;
  }

  confirmAtivar() {
    if (!this.idPendenteAcao) return;
    this.pessoaIdosaService.ativar(this.idPendenteAcao).subscribe({
      next: () => {
        this.notificationService.showSuccess('Registro ativado com sucesso.');
        this.buscar();
      },
      error: () => {
        this.notificationService.showError('Erro ao ativar registro.');
      }
    });
    this.cancelAtivar();
  }

  exportarPdf() {
    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([{ default: jsPDF }, autoTable]) => {
      const doc = new jsPDF();
      
      this.carregarLogoEConverterParaBase64().then(logoBase64 => {
        this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(resultado => {
          const pessoasFiltradas = this.aplicarFiltrosAvancados(resultado.pessoas);
          this.gerarPdf(doc, autoTable, pessoasFiltradas, logoBase64);
          doc.save('pessoas-idosas.pdf');
          this.notificationService.showSuccess('PDF gerado com sucesso!');
        });
      }).catch(() => {
        this.notificationService.showError('Erro ao carregar logo. PDF não foi gerado.');
      });
    });
  }

  private aplicarFiltrosAvancados(pessoas: PessoaIdosa[]): PessoaIdosa[] {
    const filtros = this.filtroAvancado;
    
    return pessoas.filter((pessoa: PessoaIdosa) => {
      const verificacoes = [
        () => !filtros.alfabetizado || pessoa.composicaoFamiliar?.alfabetizado === filtros.alfabetizado,
        () => !filtros.estudaAtualmente || pessoa.composicaoFamiliar?.estudaAtualmente === filtros.estudaAtualmente,
        () => !filtros.nivelSerie || pessoa.composicaoFamiliar?.nivelSerieAtualConcluido?.includes(filtros.nivelSerie),
        () => !filtros.cursoFormacao || pessoa.composicaoFamiliar?.cursosTecnicoFormacaoProfissional?.includes(filtros.cursoFormacao),
        () => !filtros.beneficio || pessoa.composicaoFamiliar?.beneficio?.includes(filtros.beneficio),
        () => !filtros.situacaoOcupacional || pessoa.composicaoFamiliar?.situacaoOcupacional?.includes(filtros.situacaoOcupacional),
        () => !filtros.problemaDeSaude || pessoa.composicaoFamiliar?.problemaDeSaude?.includes(filtros.problemaDeSaude),
        () => !filtros.aposentado || pessoa.composicaoFamiliar?.aposentado?.includes(filtros.aposentado),
        () => !filtros.moradia || pessoa.endereco?.moradia?.includes(filtros.moradia),
        () => !filtros.deficiencia || pessoa.composicaoFamiliar?.deficiencia?.includes(filtros.deficiencia)
      ];

      return verificacoes.every(verificacao => verificacao());
    });
  }

  private gerarPdf(doc: any, autoTable: any, pessoasFiltradas: PessoaIdosa[], logoBase64: string): void {
    const logoSize = 26;
    const headerHeight = 35;
    const margin = 20;
    
    this.gerarCabecalho(doc, logoBase64, margin, logoSize, headerHeight);
    this.gerarInformacoesFiltros(doc, pessoasFiltradas, margin, headerHeight);
    this.gerarTabela(doc, autoTable, pessoasFiltradas, margin, headerHeight);
    this.gerarRodape(doc);
  }

  private carregarLogoEConverterParaBase64(): Promise<string> {
    return loadAndResizeImageAsBase64({ src: '/asfa-logo.png', crossOrigin: 'anonymous', maxWidth: 80, maxHeight: 80, outputType: 'image/png' });
  }

  private gerarCabecalho(doc: any, logoBase64: string, margin: number, logoSize: number, headerHeight: number): void {
    doc.addImage(logoBase64, 'PNG', margin, margin, logoSize, logoSize);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Associação Católica Sagrada Família - Lar Misericordioso', margin + logoSize + 10, margin + 12);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')} - Campo Grande/MS`, margin + logoSize + 10, margin + 22);
    doc.line(margin, margin + headerHeight, doc.internal.pageSize.width - margin, margin + headerHeight);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Pessoas Idosas Cadastradas', doc.internal.pageSize.width / 2, margin + headerHeight + 10, { align: 'center' });
  }

  private gerarInformacoesFiltros(doc: any, pessoasFiltradas: PessoaIdosa[], margin: number, headerHeight: number): void {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPosition = margin + headerHeight + 20;
    
    const filtrosAplicados = [];
    if (this.filtro.nome) filtrosAplicados.push(`Nome: ${this.filtro.nome}`);
    if (this.filtro.cpf) filtrosAplicados.push(`CPF: ${this.filtro.cpf}`);
    if (this.filtro.estadoCivil) filtrosAplicados.push(`Estado Civil: ${this.filtro.estadoCivil}`);
    if (this.filtro.ativo !== undefined) filtrosAplicados.push(`Status: ${this.filtro.ativo ? 'Ativo' : 'Inativo'}`);
    
    if (filtrosAplicados.length > 0) {
      doc.text('Filtros aplicados: ' + filtrosAplicados.join(', '), margin, yPosition);
      yPosition += 8;
    }
    
    doc.text(`Total de registros: ${pessoasFiltradas.length}`, margin, yPosition);
  }

  private gerarTabela(doc: any, autoTable: any, pessoasFiltradas: PessoaIdosa[], margin: number, headerHeight: number): void {
    const yPosition = margin + headerHeight + 30;
    
    const headers = ['Nome', 'Data Nasc.', 'Estado Civil', 'CPF', 'RG', 'CEP', 'Status'];
    const rows = pessoasFiltradas.map(pessoa => [
      pessoa.nome,
      new Date(pessoa.dataNascimento).toLocaleDateString('pt-BR'),
      pessoa.estadoCivil || '-',
      pessoa.cpf || '-',
      pessoa.rg || '-',
      pessoa.endereco?.cep || '-',
      pessoa.ativo ? 'Ativo' : 'Inativo'
    ]);

    try {
      autoTable.default(doc, {
        head: [headers],
        body: rows,
        startY: yPosition,
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [70, 130, 180],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: margin, right: margin }
      });
    } catch (error) {
      this.desenharTabelaManual(doc, headers, rows, yPosition, margin);
    }
  }

  private desenharTabelaManual(doc: any, headers: string[], rows: string[][], startY: number, margin: number): void {
    const colWidth = 25;
    const rowHeight = 8;
    
    doc.setFillColor(70, 130, 180);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    
    headers.forEach((header, index) => {
      const x = margin + (index * colWidth);
      doc.rect(x, startY, colWidth, rowHeight, 'F');
      doc.text(header, x + 2, startY + 5);
    });
    
    doc.setTextColor(0, 0, 0);
    rows.forEach((row, rowIndex) => {
      const y = startY + rowHeight + (rowIndex * rowHeight);
      
      row.forEach((cell, colIndex) => {
        const x = margin + (colIndex * colWidth);
        doc.rect(x, y, colWidth, rowHeight, 'S');
        doc.text(cell || '-', x + 2, y + 5);
      });
    });
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

  navigate(path: string) {
    this.router.navigate([path]);
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value || '';
  }
  
  getChecked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }
  
  get math() { return Math; }

  setFiltroAvancado(campo: keyof typeof this.filtroAvancado, valor: any): void {
    (this.filtroAvancado as any)[campo] = valor;
  }
}