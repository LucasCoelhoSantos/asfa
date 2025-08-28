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
  imports: [CommonModule, MainMenuComponent, TableSkeletonComponent, CpfPipe, TelefonePipe, CepPipe, RgPipe, MaskDirective],
  templateUrl: './pessoa-idosa-list.html',
  styleUrls: ['./pessoa-idosa-list.scss']
})
export class PessoaIdosaListComponent implements OnInit, OnDestroy {
  private pessoaIdosaService = inject(PessoaIdosaService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Observables reativos
  pessoas$!: Observable<PaginacaoResult>;
  loading$ = new BehaviorSubject<boolean>(false);

  // Estado de filtros (agora não aplica automaticamente)
  filtro: FiltrosPessoaIdosa = {
    nome: '',
    dataNascimento: '',
    estadoCivil: '',
    cpf: '',
    rg: '',
    cep: ''
  };

  // Paginação
  pageSizeOptions = PAGE_SIZE_OPTIONS;
  pageSize = 20;
  pageIndex = 0;
  lastDoc: any = null;
  total = 0;
  hasMore = false;

  estadosCivis = ESTADOS_CIVIS;
  
  // Enums para os filtros
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

  ngOnInit() {
    this.carregarDadosIniciais();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarDadosIniciais() {
    this.loading$.next(true);
    // Carrega dados iniciais sem filtros
    this.pessoaIdosaService.aplicarFiltros({});
    this.pessoas$ = this.pessoaIdosaService.pessoas$!;
    
    // Inscreve no observable para atualizar o loading
    this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.total = result.total;
      this.hasMore = result.hasMore;
      this.lastDoc = result.lastDoc;
      this.loading$.next(false);
      this.cdr.detectChanges();
    });
  }

  // Método principal para buscar com filtros
  buscar() {
    this.loading$.next(true);
    this.pageIndex = 0; // Reset para primeira página
    this.lastDoc = null; // Reset do cursor de paginação
    
    // Aplica os filtros básicos
    this.pessoaIdosaService.aplicarFiltros(this.filtro);
    this.pessoas$ = this.pessoaIdosaService.pessoas$!;
    
    // Inscreve novamente no observable
    this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.total = result.total;
      this.hasMore = result.hasMore;
      this.lastDoc = result.lastDoc;
      this.loading$.next(false);
      this.cdr.detectChanges();
    });
  }

  // Método para limpar filtros
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

  // Métodos de filtro atualizados (não aplicam automaticamente)
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
    this.buscar(); // Aplica imediatamente para mudança de tamanho da página
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

  inativar(id: string) {
    if (confirm('Tem certeza que deseja inativar este registro?')) {
      this.pessoaIdosaService.inativar(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Registro inativado com sucesso.');
          this.buscar(); // Recarrega os dados
        },
        error: (error) => {
          this.notificationService.showError('Erro ao inativar registro.');
        }
      });
    }
  }

  ativar(id: string) {
    if (confirm('Tem certeza que deseja ativar este registro?')) {
      this.pessoaIdosaService.ativar(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Registro ativado com sucesso.');
          this.buscar(); // Recarrega os dados
        },
        error: (error) => {
          this.notificationService.showError('Erro ao ativar registro.');
        }
      });
    }
  }

  exportarPdf() {
    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([{ default: jsPDF }, autoTable]) => {
      const doc = new jsPDF();
      // Usar o observable para obter os dados atuais
      this.pessoas$.pipe(takeUntil(this.destroy$)).subscribe(resultado => {
        // Aplicar filtros avançados client-side
        const pessoasFiltradas = resultado.pessoas.filter((p: PessoaIdosa) => {
          const f = this.filtroAvancado;
          return (!f.alfabetizado || p.composicaoFamiliar?.alfabetizado === f.alfabetizado)
            && (!f.estudaAtualmente || p.composicaoFamiliar?.estudaAtualmente === f.estudaAtualmente)
            && (!f.nivelSerie || p.composicaoFamiliar?.nivelSerieAtualConcluido?.includes(f.nivelSerie))
            && (!f.cursoFormacao || p.composicaoFamiliar?.cursosTecnicoFormacaoProfissional?.includes(f.cursoFormacao))
            && (!f.beneficio || p.composicaoFamiliar?.beneficio?.includes(f.beneficio))
            && (!f.situacaoOcupacional || p.composicaoFamiliar?.situacaoOcupacional?.includes(f.situacaoOcupacional))
            && (!f.problemaDeSaude || p.composicaoFamiliar?.problemaDeSaude?.includes(f.problemaDeSaude))
            && (!f.aposentado || p.composicaoFamiliar?.aposentado?.includes(f.aposentado))
            && (!f.moradia || p.endereco?.moradia?.includes(f.moradia))
            && (!f.deficiencia || p.composicaoFamiliar?.deficiencia?.includes(f.deficiencia));
        });
        autoTable.default(doc, {
          head: [[
            'Nome', 'Data Nasc.', 'Estado Civil', 'CPF', 'RG', 'CEP', 'Ativo'
          ]],
          body: pessoasFiltradas.map((p: PessoaIdosa) => [
            p.nome,
            new Date(p.dataNascimento).toLocaleDateString(),
            p.estadoCivil,
            p.cpf,
            p.rg,
            p.endereco?.cep,
            p.ativo ? 'Sim' : 'Não'
          ]),
          styles: { fontSize: 10 }
        });
        doc.save('pessoas-idosas.pdf');
      });
    });
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

  // Métodos de filtro avançado (não aplicam automaticamente)
  setFiltroAlfabetizado(valor: boolean) { this.filtroAvancado.alfabetizado = valor; }
  setFiltroEstudaAtualmente(valor: boolean) { this.filtroAvancado.estudaAtualmente = valor; }
  setFiltroNivelSerie(valor: string) { this.filtroAvancado.nivelSerie = valor; }
  setFiltroCursoFormacao(valor: string) { this.filtroAvancado.cursoFormacao = valor; }
  setFiltroBeneficio(valor: string) { this.filtroAvancado.beneficio = valor; }
  setFiltroSituacaoOcupacional(valor: string) { this.filtroAvancado.situacaoOcupacional = valor; }
  setFiltroProblemaDeSaude(valor: string) { this.filtroAvancado.problemaDeSaude = valor; }
  setFiltroAposentado(valor: string) { this.filtroAvancado.aposentado = valor; }
  setFiltroMoradia(valor: string) { this.filtroAvancado.moradia = valor; }
  setFiltroDeficiencia(valor: string) { this.filtroAvancado.deficiencia = valor; }
}