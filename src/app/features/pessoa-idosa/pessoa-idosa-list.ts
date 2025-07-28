import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoaIdosaService } from './pessoa-idosa.service';
import { PessoaIdosa } from '../../models/pessoa-idosa.model';
import { Router } from '@angular/router';
import { MainMenuComponent } from '../../shared/main-menu/main-menu';

const ESTADOS_CIVIS = ['solteiro', 'casado', 'viúvo', 'divorciado'];
const PAGE_SIZE_OPTIONS = [20, 50, 100, -1];

@Component({
  selector: 'app-pessoa-idosa-list',
  standalone: true,
  imports: [CommonModule, MainMenuComponent],
  templateUrl: './pessoa-idosa-list.html',
  styleUrls: ['./pessoa-idosa-list.scss']
})
export class PessoaIdosaListComponent implements OnInit {
  private pessoaIdosaService = inject(PessoaIdosaService);
  private router = inject(Router);

  // Estado de filtros
  filtro = {
    nome: '',
    dataNascimento: '',
    estadoCivil: '',
    cpf: '',
    rg: '',
    cep: '',
    ativo: '',
    // ...outros filtros se necessário
  };

  // Paginação
  pageSizeOptions = PAGE_SIZE_OPTIONS;
  pageSize = 20;
  pageIndex = 0;
  lastDoc: any = null;
  loading = false;
  total = 0;

  pessoas: PessoaIdosa[] = [];
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
    this.buscarPessoas();
  }

  async buscarPessoas(resetPage = false) {
    this.loading = true;
    if (resetPage) {
      this.pageIndex = 0;
      this.lastDoc = null;
    }
    const filtros: any = {};
    if (this.filtro.nome) filtros.nome = this.filtro.nome;
    if (this.filtro.cpf) filtros.cpf = this.filtro.cpf;
    if (this.filtro.estadoCivil) filtros.estadoCivil = this.filtro.estadoCivil;
    if (this.filtro.ativo) filtros.ativo = this.filtro.ativo === 'ativo';
    // ...outros filtros
    const res = await this.pessoaIdosaService.getPaginated(this.pageSize, this.lastDoc, filtros);
    this.pessoas = res.pessoas;
    this.lastDoc = res.lastDoc;
    this.total = res.total;
    this.loading = false;
  }

  setFiltroNome(valor: string) { this.filtro.nome = valor; this.buscarPessoas(true); }
  setFiltroDataNascimento(valor: string) { this.filtro.dataNascimento = valor; this.buscarPessoas(true); }
  setFiltroEstadoCivil(valor: string) { this.filtro.estadoCivil = valor; this.buscarPessoas(true); }
  setFiltroCpf(valor: string) { this.filtro.cpf = valor; this.buscarPessoas(true); }
  setFiltroRg(valor: string) { this.filtro.rg = valor; this.buscarPessoas(true); }
  setFiltroCep(valor: string) { this.filtro.cep = valor; this.buscarPessoas(true); }
  setFiltroAtivo(valor: string) { this.filtro.ativo = valor; this.buscarPessoas(true); }
  setPageSize(size: number) { this.pageSize = size; this.buscarPessoas(true); }

  setPageIndex(index: number) {
    if (index < 0) return;
    this.pageIndex = index;
    this.buscarPessoas();
  }

  editar(id: string) {
    this.router.navigate(['/pessoa-idosa', id, 'editar']);
  }

  inativar(id: string) {
    if (confirm('Tem certeza que deseja inativar este registro?')) {
      this.pessoaIdosaService.inativar(id).then(() => this.buscarPessoas());
    }
  }

  exportarPdf() {
    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([{ default: jsPDF }, autoTable]) => {
      const doc = new jsPDF();
      // Aplicar filtros avançados client-side
      const pessoasFiltradas = this.pessoas.filter(p => {
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

  get pessoasFiltradas() {
    const f = this.filtroAvancado;
    return this.pessoas.filter(p => {
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
  }

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