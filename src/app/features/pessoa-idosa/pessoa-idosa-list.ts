import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoaIdosaService } from './pessoa-idosa.service';
import { PessoaIdosa } from '../../models/pessoa-idosa.model';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

const ESTADOS_CIVIS = ['solteiro', 'casado', 'viúvo', 'divorciado'];
const PAGE_SIZE_OPTIONS = [20, 50, 100, -1];

@Component({
  selector: 'app-pessoa-idosa-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pessoa-idosa-list.html',
  styleUrls: ['./pessoa-idosa-list.scss']
})
export class PessoaIdosaListComponent {
  private pessoaIdosaService = inject(PessoaIdosaService);
  private router = inject(Router);

  pessoas$ = this.pessoaIdosaService.getAll();

  // Filtros
  filtroNome = new BehaviorSubject<string>('');
  filtroDataNascimento = new BehaviorSubject<string>('');
  filtroEstadoCivil = new BehaviorSubject<string>('');
  filtroCpf = new BehaviorSubject<string>('');
  filtroRg = new BehaviorSubject<string>('');
  filtroCep = new BehaviorSubject<string>('');
  filtroAtivo = new BehaviorSubject<string>('');

  // Paginação
  pageSizeOptions = PAGE_SIZE_OPTIONS;
  pageSize = new BehaviorSubject<number>(20);
  pageIndex = new BehaviorSubject<number>(0);

  estadosCivis = ESTADOS_CIVIS;

  // Pessoas filtradas e paginadas
  pessoasFiltradas$ = combineLatest([
    this.pessoas$,
    this.filtroNome,
    this.filtroDataNascimento,
    this.filtroEstadoCivil,
    this.filtroCpf,
    this.filtroRg,
    this.filtroCep,
    this.filtroAtivo,
    this.pageSize,
    this.pageIndex
  ]).pipe(
    map(([pessoas, nome, dataNasc, estadoCivil, cpf, rg, cep, ativo, pageSize, pageIndex]) => {
      let filtradas = pessoas.filter(p =>
        (!nome || p.nome.toLowerCase().includes(nome.toLowerCase())) &&
        (!dataNasc || (p.dataNascimento && new Date(p.dataNascimento).toLocaleDateString() === dataNasc)) &&
        (!estadoCivil || p.estadoCivil === estadoCivil) &&
        (!cpf || p.cpf.includes(cpf)) &&
        (!rg || p.rg.includes(rg)) &&
        (!cep || (p.endereco?.cep || '').includes(cep)) &&
        (!ativo || (ativo === 'ativo' ? p.ativo : !p.ativo))
      );
      const total = filtradas.length;
      if (pageSize > 0) {
        filtradas = filtradas.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
      }
      return { pessoas: filtradas, total };
    })
  );

  editar(id: string) {
    this.router.navigate(['/pessoa-idosa', id, 'editar']);
  }

  inativar(id: string) {
    if (confirm('Tem certeza que deseja inativar este registro?')) {
      this.pessoaIdosaService.inativar(id);
    }
  }

  setFiltroNome(valor: string) { this.filtroNome.next(valor); this.pageIndex.next(0); }
  setFiltroDataNascimento(valor: string) { this.filtroDataNascimento.next(valor); this.pageIndex.next(0); }
  setFiltroEstadoCivil(valor: string) { this.filtroEstadoCivil.next(valor); this.pageIndex.next(0); }
  setFiltroCpf(valor: string) { this.filtroCpf.next(valor); this.pageIndex.next(0); }
  setFiltroRg(valor: string) { this.filtroRg.next(valor); this.pageIndex.next(0); }
  setFiltroCep(valor: string) { this.filtroCep.next(valor); this.pageIndex.next(0); }
  setFiltroAtivo(valor: string) { this.filtroAtivo.next(valor); this.pageIndex.next(0); }

  setPageSize(size: number) {
    this.pageSize.next(size);
    this.pageIndex.next(0);
  }
  setPageIndex(index: number) { this.pageIndex.next(index); }

  async exportarPdf() {
    const [{ default: jsPDF }, autoTable] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    const doc = new jsPDF();
    const dados = await this.pessoasFiltradas$.toPromise();
    const pessoas: PessoaIdosa[] = dados?.pessoas || [];
    autoTable.default(doc, {
      head: [[
        'Nome', 'Data Nasc.', 'Estado Civil', 'CPF', 'RG', 'CEP', 'Ativo'
      ]],
      body: pessoas.map((p: PessoaIdosa) => [
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
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value || '';
  }

  get math() { return Math; }
}