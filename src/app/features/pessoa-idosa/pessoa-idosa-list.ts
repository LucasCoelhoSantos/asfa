import { Component, inject, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
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
import { Observable, Subject, takeUntil, tap } from 'rxjs';

const ESTADOS_CIVIS = ['solteiro', 'casado', 'viúvo', 'divorciado'];
const PAGE_SIZE_OPTIONS = [20, 50, 100, -1];

@Component({
  selector: 'app-pessoa-idosa-list',
  standalone: true,
  imports: [CommonModule, MainMenuComponent, TableSkeletonComponent, CpfPipe, TelefonePipe, CepPipe],
  templateUrl: './pessoa-idosa-list.html',
  styleUrls: ['./pessoa-idosa-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PessoaIdosaListComponent implements OnInit, OnDestroy {
  private pessoaIdosaService = inject(PessoaIdosaService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  // Observables reativos
  pessoas$!: Observable<PaginacaoResult>;
  loading$ = new Subject<boolean>();

  // Estado de filtros
  filtro: FiltrosPessoaIdosa = {
    nome: '',
    dataNascimento: '',
    estadoCivil: '',
    cpf: '',
    rg: '',
    cep: '',
    ativo: true
  };

  // Paginação
  pageSizeOptions = PAGE_SIZE_OPTIONS;
  pageSize = 20;
  pageIndex = 0;
  lastDoc: any = null;
  total = 0;
  hasMore = false;

  estadosCivis = ESTADOS_CIVIS;

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
    deficiencia: ''
  };

  ngOnInit() {
    this.inicializarObservables();
    this.aplicarFiltros();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializarObservables() {
    this.pessoas$ = this.pessoaIdosaService.pessoas$.pipe(
      tap(result => {
        this.total = result.total;
        this.hasMore = result.hasMore;
        this.lastDoc = result.lastDoc;
        this.loading$.next(false);
      }),
      takeUntil(this.destroy$)
    );
  }

  private aplicarFiltros() {
    this.loading$.next(true);
    this.pessoaIdosaService.aplicarFiltros(this.filtro);
    this.pessoaIdosaService.setPaginacao(this.pageSize, this.lastDoc);
  }

  // Métodos de filtro atualizados
  setFiltroNome(valor: string) { 
    this.filtro.nome = valor; 
    this.aplicarFiltros(); 
  }
  
  setFiltroDataNascimento(valor: string) { 
    this.filtro.dataNascimento = valor; 
    this.aplicarFiltros(); 
  }
  
  setFiltroEstadoCivil(valor: string) { 
    this.filtro.estadoCivil = valor; 
    this.aplicarFiltros(); 
  }
  
  setFiltroCpf(valor: string) { 
    this.filtro.cpf = valor; 
    this.aplicarFiltros(); 
  }
  
  setFiltroRg(valor: string) { 
    this.filtro.rg = valor; 
    this.aplicarFiltros(); 
  }
  
  setFiltroCep(valor: string) { 
    this.filtro.cep = valor; 
    this.aplicarFiltros(); 
  }
  
  setFiltroAtivo(valor: string) { 
    this.filtro.ativo = valor === 'ativo'; 
    this.aplicarFiltros(); 
  }
  
  setPageSize(size: number) { 
    this.pageSize = size; 
    this.aplicarFiltros(); 
  }

  setPageIndex(index: number) {
    if (index < 0) return;
    this.pageIndex = index;
    this.aplicarFiltros();
  }

  editar(id: string) {
    this.router.navigate(['/pessoa-idosa', id, 'editar']);
  }

  inativar(id: string) {
    if (confirm('Tem certeza que deseja inativar este registro?')) {
      this.pessoaIdosaService.inativar(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Registro inativado com sucesso.');
          this.aplicarFiltros();
        },
        error: (error) => {
          this.notificationService.showError('Erro ao inativar registro.');
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