import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoaIdosaService, FiltrosPessoaIdosa, ResultadoPaginacao } from './pessoa-idosa.service';
import { PessoaIdosa } from '../../models/pessoa-idosa.model';
import { Router } from '@angular/router';
import { MainMenuComponent } from '../../shared/components/main-menu/main-menu';
import { TableSkeletonComponent } from '../../shared/components/skeleton/table-skeleton.component';
import { ModalComponent } from '../../shared/components/modal/modal';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { CpfPipe } from '../../shared/pipes/cpf.pipe';
import { TelefonePipe } from '../../shared/pipes/telefone.pipe';
import { CepPipe } from '../../shared/pipes/cep.pipe';
import { RgPipe } from '../../shared/pipes/rg.pipe';
import { PdfService } from '../../shared/services/pdf.service';
import { MaskDirective } from '../../shared/directives/mask.directive';
import { Observable, Subject, BehaviorSubject, takeUntil } from 'rxjs';
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
  private notificationService = inject(NotificacaoService);
  private cdr = inject(ChangeDetectorRef);
  private pdfService = inject(PdfService);
  private readonly destroy$ = new Subject<void>();

  pessoas$!: Observable<ResultadoPaginacao>;
  public readonly loading$ = new BehaviorSubject<boolean>(false);

  filtro: FiltrosPessoaIdosa = {
    nome: '',
    dataNascimento: '',
    estadoCivil: '',
    cpf: '',
    rg: '',
    cep: ''
  };

  opcoesTamanhoPagina = PAGE_SIZE_OPTIONS;
  tamanhoPagina = 20;
  indicePagina = 0;
  ultimoDocumento: any = null;
  total = 0;
  temMais = false;

  estadosCivis = ESTADO_CIVIL_OPCOES;
  
  beneficios = BENEFICIOS_OPCOES;
  rendas = RENDAS_OPCOES;
  situacoesOcupacionais = SITUACOES_OCUPACIONAIS_OPCOES;
  aposentados = APOSENTADO_OPCOES;
  deficiencias = DEFICIENCIA_OPCOES;
  niveisSerie = ESCOLARIDADE_OPCOES;
  cursosFormacao = TIPO_FORMACAO_PROFISSIONAL_OPCOES;
  problemasSaude = PROBLEMA_DE_SAUDE_OPCOES;
  moradias = MORADIAS_OPCOES;

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

  mostrarModalConfirmacao = false;
  private idPendenteAcao: string | null = null;
  private acaoPendente: 'ativar' | 'inativar' | null = null;

  get tituloConfirmacao(): string {
    if (this.acaoPendente === 'ativar') return 'Ativar registro';
    if (this.acaoPendente === 'inativar') return 'Inativar registro';
    return '';
  }

  get mensagemConfirmacao(): string {
    if (this.acaoPendente === 'ativar') return 'Tem certeza que deseja ativar este registro?';
    if (this.acaoPendente === 'inativar') return 'Tem certeza que deseja inativar este registro?';
    return '';
  }

  get confirmarTexto(): string {
    if (this.acaoPendente === 'ativar') return 'Ativar';
    if (this.acaoPendente === 'inativar') return 'Inativar';
    return '';
  }

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
    
    this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(resultado => {
      this.total = resultado.total;
      this.temMais = resultado.temMais;
      this.ultimoDocumento = resultado.ultimoDocumento;
      this.loading$.next(false);
      this.cdr.detectChanges();
    });
  }

  buscar() {
    this.loading$.next(true);
    this.indicePagina = 0;
    this.ultimoDocumento = null;
    
    this.pessoaIdosaService.aplicarFiltros(this.filtro);
    this.pessoas$ = this.pessoaIdosaService.pessoas$!;
    
    this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(resultado => {
      this.total = resultado.total;
      this.temMais = resultado.temMais;
      this.ultimoDocumento = resultado.ultimoDocumento;
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

  definirFiltro(campo: keyof FiltrosPessoaIdosa, valor: string | boolean | undefined) {
    if (campo === 'ativo') {
      this.filtro.ativo = valor === 'ativo' ? true : valor === 'inativo' ? false : undefined;
    } else {
      (this.filtro as any)[campo] = valor;
    }
  }
  
  definirTamanhoPagina(tamanho: number) { 
    this.tamanhoPagina = tamanho; 
    this.buscar();
  }

  definirIndicePagina(indice: number) {
    if (indice < 0) return;
    this.indicePagina = indice;
    this.loading$.next(true);
    this.pessoaIdosaService.definirPaginacao(this.tamanhoPagina, this.ultimoDocumento);
  }

  editar(id: string) {
    this.router.navigate(['/pessoa-idosa', id, 'editar']);
  }

  visualizar(id: string) {
    this.router.navigate(['/pessoa-idosa', id, 'visualizar']);
  }

  abrirConfirmacao(acao: 'ativar' | 'inativar', id: string) {
    this.idPendenteAcao = id;
    this.acaoPendente = acao;
    this.mostrarModalConfirmacao = true;
  }

  cancelarAcao() {
    this.mostrarModalConfirmacao = false;
    this.idPendenteAcao = null;
    this.acaoPendente = null;
  }

  confirmarAcao() {
    if (!this.idPendenteAcao || !this.acaoPendente) return;
    const acao = this.acaoPendente;
    const id = this.idPendenteAcao;

    const obs = acao === 'ativar'
      ? this.pessoaIdosaService.ativar(id)
      : this.pessoaIdosaService.inativar(id);

    obs.subscribe({
      next: () => {
        const sucesso = acao === 'ativar' ? 'Registro ativado com sucesso.' : 'Registro inativado com sucesso.';
        this.notificationService.mostrarSucesso(sucesso);
        this.buscar();
      },
      error: () => {
        const erro = acao === 'ativar' ? 'Erro ao ativar registro.' : 'Erro ao inativar registro.';
        this.notificationService.mostrarErro(erro);
      }
    });
    this.cancelarAcao();
  }

  exportarPdf() {
    this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(resultado => {
      const pessoasFiltradas = this.aplicarFiltrosAvancados(resultado.pessoas);
      this.pdfService.gerarPdfLista(pessoasFiltradas, {
        nome: this.filtro.nome,
        cpf: this.filtro.cpf,
        estadoCivil: this.filtro.estadoCivil,
        ativo: this.filtro.ativo
      }).then(() => this.notificationService.mostrarSucesso('PDF gerado com sucesso!'))
        .catch(() => this.notificationService.mostrarErro('Erro ao gerar PDF.'));
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

  navegar(caminho: string) {
    this.router.navigate([caminho]);
  }

  obterValor(evento: Event): string {
    return (evento.target as HTMLInputElement | HTMLSelectElement).value || '';
  }
  
  obterMarcado(evento: Event): boolean {
    return (evento.target as HTMLInputElement).checked;
  }
  
  get math() { return Math; }

  definirFiltroAvancado(campo: keyof typeof this.filtroAvancado, valor: any): void {
    (this.filtroAvancado as any)[campo] = valor;
  }
}