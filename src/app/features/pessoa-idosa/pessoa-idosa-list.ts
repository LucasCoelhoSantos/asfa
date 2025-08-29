import { Component, inject, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoaIdosaService, FiltrosPessoaIdosa, PaginacaoResult } from './pessoa-idosa.service';
import { PessoaIdosa } from '../../models/pessoa-idosa.model';
import { Router } from '@angular/router';
import { MainMenuComponent } from '../../shared/main-menu/main-menu';
import { TableSkeletonComponent } from '../../shared/skeleton/table-skeleton.component';
import { NotificationService } from '../../core/services/notification.service';
import { CpfPipe } from '../../shared/pipes/cpf.pipe';
import { TelefonePipe } from '../../shared/pipes/telefone.pipe';
import { CepPipe } from '../../shared/pipes/cep.pipe';
import { RgPipe } from '../../shared/pipes/rg.pipe';
import { MaskDirective } from '../../shared/directives/mask.directive';
import { ModalComponent } from '../../shared/modal/modal';
import { 
  Beneficio, 
  Renda, 
  SituacaoOcupacional, 
  Aposentado, 
  Deficiencia, 
  NivelSerieAtualConcluido, 
  CursoTecnicoFormacaoProfissional, 
  ProblemaDeSaude,
  Moradia
} from '../../models/enums';
import { Observable, Subject, BehaviorSubject, takeUntil, tap } from 'rxjs';
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
  templateUrl: './pessoa-idosa-list.html',
  //styleUrls: ['./pessoa-idosa-list.scss']
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

  setFiltroNome(valor: string) { 
    this.filtro.nome = valor; 
  }
  
  setFiltroDataNascimento(valor: string) { 
    this.filtro.dataNascimento = valor; 
  }
  
  setFiltroEstadoCivil(valor: string) { 
    this.filtro.estadoCivil = valor; 
  }
  
  setFiltroCpf(valor: string) { 
    this.filtro.cpf = valor; 
  }
  
  setFiltroRg(valor: string) { 
    this.filtro.rg = valor; 
  }
  
  setFiltroCep(valor: string) { 
    this.filtro.cep = valor; 
  }
  
  setFiltroAtivo(valor: string) { 
    this.filtro.ativo = valor === 'ativo' ? true : valor === 'inativo' ? false : undefined; 
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
      this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(resultado => {
        const pessoasFiltradas = this.aplicarFiltrosAvancados(resultado.pessoas);
        this.gerarTabelaPdf(doc, autoTable, pessoasFiltradas);
        doc.save('pessoas-idosas.pdf');
      });
    });
  }

  private aplicarFiltrosAvancados(pessoas: PessoaIdosa[]): PessoaIdosa[] {
    return pessoas.filter((p: PessoaIdosa) => {
      const f = this.filtroAvancado;
      return this.passouFiltroAlfabetizado(p, f)
        && this.passouFiltroEstudaAtualmente(p, f)
        && this.passouFiltroNivelSerie(p, f)
        && this.passouFiltroCursoFormacao(p, f)
        && this.passouFiltroBeneficio(p, f)
        && this.passouFiltroSituacaoOcupacional(p, f)
        && this.passouFiltroProblemaDeSaude(p, f)
        && this.passouFiltroAposentado(p, f)
        && this.passouFiltroMoradia(p, f)
        && this.passouFiltroDeficiencia(p, f);
    });
  }

  private passouFiltroAlfabetizado(p: PessoaIdosa, f: any): boolean {
    return !f.alfabetizado || p.composicaoFamiliar?.alfabetizado === f.alfabetizado;
  }

  private passouFiltroEstudaAtualmente(p: PessoaIdosa, f: any): boolean {
    return !f.estudaAtualmente || p.composicaoFamiliar?.estudaAtualmente === f.estudaAtualmente;
  }

  private passouFiltroNivelSerie(p: PessoaIdosa, f: any): boolean {
    return !f.nivelSerie || p.composicaoFamiliar?.nivelSerieAtualConcluido?.includes(f.nivelSerie);
  }

  private passouFiltroCursoFormacao(p: PessoaIdosa, f: any): boolean {
    return !f.cursoFormacao || p.composicaoFamiliar?.cursosTecnicoFormacaoProfissional?.includes(f.cursoFormacao);
  }

  private passouFiltroBeneficio(p: PessoaIdosa, f: any): boolean {
    return !f.beneficio || p.composicaoFamiliar?.beneficio?.includes(f.beneficio);
  }

  private passouFiltroSituacaoOcupacional(p: PessoaIdosa, f: any): boolean {
    return !f.situacaoOcupacional || p.composicaoFamiliar?.situacaoOcupacional?.includes(f.situacaoOcupacional);
  }

  private passouFiltroProblemaDeSaude(p: PessoaIdosa, f: any): boolean {
    return !f.problemaDeSaude || p.composicaoFamiliar?.problemaDeSaude?.includes(f.problemaDeSaude);
  }

  private passouFiltroAposentado(p: PessoaIdosa, f: any): boolean {
    return !f.aposentado || p.composicaoFamiliar?.aposentado?.includes(f.aposentado);
  }

  private passouFiltroMoradia(p: PessoaIdosa, f: any): boolean {
    return !f.moradia || p.endereco?.moradia?.includes(f.moradia);
  }

  private passouFiltroDeficiencia(p: PessoaIdosa, f: any): boolean {
    return !f.deficiencia || p.composicaoFamiliar?.deficiencia?.includes(f.deficiencia);
  }

  private gerarTabelaPdf(doc: any, autoTable: any, pessoasFiltradas: PessoaIdosa[]): void {
    autoTable.default(doc, {
      head: [[
        'Nome', 'Data Nasc.', 'Estado Civil', 'CPF', 'RG', 'CEP', 'Ativo'
      ]],
      body: pessoasFiltradas.map((p: PessoaIdosa) => this.criarLinhaTabela(p)),
      styles: { fontSize: 10 }
    });
  }

  private criarLinhaTabela(p: PessoaIdosa): any[] {
    return [
      p.nome,
      new Date(p.dataNascimento).toLocaleDateString(),
      p.estadoCivil,
      p.cpf,
      p.rg,
      p.endereco?.cep,
      p.ativo ? 'Sim' : 'Não'
    ];
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
  
  setFiltroAlfabetizado(valor: boolean) { this.setFiltroAvancado('alfabetizado', valor); }
  setFiltroEstudaAtualmente(valor: boolean) { this.setFiltroAvancado('estudaAtualmente', valor); }
  setFiltroNivelSerie(valor: string) { this.setFiltroAvancado('nivelSerie', valor); }
  setFiltroCursoFormacao(valor: string) { this.setFiltroAvancado('cursoFormacao', valor); }
  setFiltroBeneficio(valor: string) { this.setFiltroAvancado('beneficio', valor); }
  setFiltroSituacaoOcupacional(valor: string) { this.setFiltroAvancado('situacaoOcupacional', valor); }
  setFiltroProblemaDeSaude(valor: string) { this.setFiltroAvancado('problemaDeSaude', valor); }
  setFiltroAposentado(valor: string) { this.setFiltroAvancado('aposentado', valor); }
  setFiltroMoradia(valor: string) { this.setFiltroAvancado('moradia', valor); }
  setFiltroDeficiencia(valor: string) { this.setFiltroAvancado('deficiencia', valor); }
}