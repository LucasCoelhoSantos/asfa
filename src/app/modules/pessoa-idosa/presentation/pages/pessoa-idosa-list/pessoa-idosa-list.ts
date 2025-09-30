import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoaIdosaFacade } from '../../../application/pessoa-idosa.facade';
import { PessoaIdosaListFilters } from '../../../domain/repositories/pessoa-idosa.repository';
import { PessoaIdosa } from '../../../domain/entities/pessoa-idosa.entity';
import { Router } from '@angular/router';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { PdfService } from '../../../../../shared/services/pdf.service';
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
} from '../../../../../shared/constants/app.constants';
const PAGE_SIZE_OPTIONS = [20, 50, 100, -1];

@Component({
  selector: 'app-pessoa-idosa-list',
  standalone: true,
  imports: [CommonModule, MainMenuComponent],
  templateUrl: './pessoa-idosa-list.html'
})
export class PessoaIdosaListPage implements OnInit, OnDestroy {
  private pessoaIdosa = inject(PessoaIdosaFacade);
  private router = inject(Router);
  private notificationService = inject(NotificacaoService);
  private cdr = inject(ChangeDetectorRef);
  private pdfService = inject(PdfService);
  private readonly destroy$ = new Subject<void>();

  pessoas$!: Observable<{ pessoas: PessoaIdosa[]; total: number; temMais: boolean; cursor: any }>;
  public readonly loading$ = new BehaviorSubject<boolean>(false);

  filtro: PessoaIdosaListFilters = {
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

  get tituloConfirmacao(): string { if (this.acaoPendente === 'ativar') return 'Ativar registro'; if (this.acaoPendente === 'inativar') return 'Inativar registro'; return ''; }
  get mensagemConfirmacao(): string { if (this.acaoPendente === 'ativar') return 'Tem certeza que deseja ativar este registro?'; if (this.acaoPendente === 'inativar') return 'Tem certeza que deseja inativar este registro?'; return ''; }
  get confirmarTexto(): string { if (this.acaoPendente === 'ativar') return 'Ativar'; if (this.acaoPendente === 'inativar') return 'Inativar'; return ''; }

  ngOnInit() { this.carregarDadosIniciais(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  private carregarDadosIniciais() {
    this.loading$.next(true);
    this.pessoas$ = this.pessoaIdosa.page$ as any;
    this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(page => { this.total = page.total; this.temMais = page.temMais; this.ultimoDocumento = page.cursor; this.loading$.next(false); this.cdr.detectChanges(); });
    this.pessoaIdosa.carregarPagina(this.tamanhoPagina, null, {});
  }

  buscar() {
    this.loading$.next(true);
    this.indicePagina = 0;
    this.ultimoDocumento = null;
    this.pessoas$ = this.pessoaIdosa.page$ as any;
    this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(page => { this.total = page.total; this.temMais = page.temMais; this.ultimoDocumento = page.cursor; this.loading$.next(false); this.cdr.detectChanges(); });
    this.pessoaIdosa.carregarPagina(this.tamanhoPagina, null, this.filtro);
  }

  limparFiltros() {
    this.filtro = { nome: '', dataNascimento: '', estadoCivil: '', cpf: '', rg: '', cep: '' } as any;
    this.filtroAvancado = { alfabetizado: false, estudaAtualmente: false, nivelSerie: '', cursoFormacao: '', beneficio: '', situacaoOcupacional: '', problemaDeSaude: '', aposentado: '', moradia: '', deficiencia: '', moradias: '' } as any;
    this.buscar();
  }

  definirFiltro(campo: keyof PessoaIdosaListFilters, valor: string | boolean | undefined) { if (campo === 'ativo') { this.filtro.ativo = valor === 'ativo' ? true : valor === 'inativo' ? false : undefined; } else { (this.filtro as any)[campo] = valor; } }
  definirTamanhoPagina(tamanho: number) { this.tamanhoPagina = tamanho; this.buscar(); }
  definirIndicePagina(indice: number) { if (indice < 0) return; this.indicePagina = indice; this.loading$.next(true); this.pessoaIdosa.carregarPagina(this.tamanhoPagina, this.ultimoDocumento, this.filtro); }
  editar(id: string) { this.router.navigate(['/pessoa-idosa', id, 'editar']); }
  visualizar(id: string) { this.router.navigate(['/pessoa-idosa', id, 'visualizar']); }
  abrirConfirmacao(acao: 'ativar' | 'inativar', id: string) { this.idPendenteAcao = id; this.acaoPendente = acao; this.mostrarModalConfirmacao = true; }
  cancelarAcao() { this.mostrarModalConfirmacao = false; this.idPendenteAcao = null; this.acaoPendente = null; }
  async confirmarAcao() {
    if (!this.idPendenteAcao || !this.acaoPendente) return;
    const acao = this.acaoPendente; const id = this.idPendenteAcao;
    try {
      if (acao === 'ativar') await this.pessoaIdosa.ativar(id); else await this.pessoaIdosa.inativar(id);
      const sucesso = acao === 'ativar' ? 'Registro ativado com sucesso.' : 'Registro inativado com sucesso.';
      this.notificationService.mostrarSucesso(sucesso);
      this.buscar();
    } catch {
      const erro = acao === 'ativar' ? 'Erro ao ativar registro.' : 'Erro ao inativar registro.';
      this.notificationService.mostrarErro(erro);
    }
    this.cancelarAcao();
  }
  exportarPdf() { this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(resultado => { const pessoasFiltradas = this.aplicarFiltrosAvancados(resultado.pessoas); this.pdfService.gerarPdfLista(pessoasFiltradas, { nome: this.filtro.nome, cpf: this.filtro.cpf, estadoCivil: this.filtro.estadoCivil, ativo: this.filtro.ativo }).then(() => this.notificationService.mostrarSucesso('PDF gerado com sucesso!')).catch(() => this.notificationService.mostrarErro('Erro ao gerar PDF.')); }); }
  private aplicarFiltrosAvancados(pessoas: PessoaIdosa[]): PessoaIdosa[] { const filtros = this.filtroAvancado as any; return pessoas.filter((pessoa: PessoaIdosa) => { const verificacoes = [() => !filtros.alfabetizado || pessoa.composicaoFamiliar?.alfabetizado === filtros.alfabetizado, () => !filtros.estudaAtualmente || pessoa.composicaoFamiliar?.estudaAtualmente === filtros.estudaAtualmente, () => !filtros.nivelSerie || pessoa.composicaoFamiliar?.nivelSerieAtualConcluido?.includes(filtros.nivelSerie), () => !filtros.cursoFormacao || pessoa.composicaoFamiliar?.cursosTecnicoFormacaoProfissional?.includes(filtros.cursoFormacao), () => !filtros.beneficio || pessoa.composicaoFamiliar?.beneficio?.includes(filtros.beneficio), () => !filtros.situacaoOcupacional || pessoa.composicaoFamiliar?.situacaoOcupacional?.includes(filtros.situacaoOcupacional), () => !filtros.problemaDeSaude || pessoa.composicaoFamiliar?.problemaDeSaude?.includes(filtros.problemaDeSaude), () => !filtros.aposentado || pessoa.composicaoFamiliar?.aposentado?.includes(filtros.aposentado), () => !filtros.moradia || pessoa.endereco?.moradia?.includes(filtros.moradia), () => !filtros.deficiencia || pessoa.composicaoFamiliar?.deficiencia?.includes(filtros.deficiencia)]; return verificacoes.every((v: any) => v()); }); }
  navegar(caminho: string) { this.router.navigate([caminho]); }
  trackById = (_: number, item: PessoaIdosa) => item.id;
  obterValor(evento: Event): string { return (evento.target as HTMLInputElement | HTMLSelectElement).value || ''; }
  obterMarcado(evento: Event): boolean { return (evento.target as HTMLInputElement).checked; }
  get math() { return Math; }
  definirFiltroAvancado(campo: keyof typeof this.filtroAvancado, valor: any): void { (this.filtroAvancado as any)[campo] = valor; }
}