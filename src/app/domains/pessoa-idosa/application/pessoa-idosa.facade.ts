import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PessoaIdosa, CriarPessoaIdosaProps, AtualizarPessoaIdosaProps } from '../domain/entities/pessoa-idosa.entity';
import { PessoaIdosaFiltros } from '../domain/repositories/pessoa-idosa.repository';
import {
  ObterTodasPessoasIdosasUseCase,
  ObterPessoaIdosaPorIdUseCase,
  CriarPessoaIdosaUseCase,
  AtualizarPessoaIdosaUseCase,
  AtivarPessoaIdosaUseCase,
  InativarPessoaIdosaUseCase,
  ObterTodasPessoasIdosasPaginadoUseCase
} from './use-cases/pessoa-idosa.use-cases';
import { PdfService } from '../../../shared/services/pdf.service';
import { formatDate } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PessoaIdosaFacade {
  private readonly obterTodosUC = inject(ObterTodasPessoasIdosasUseCase);
  private readonly obterTodosPaginadoUC = inject(ObterTodasPessoasIdosasPaginadoUseCase);
  private readonly obterPorIdUC = inject(ObterPessoaIdosaPorIdUseCase);
  private readonly criarUC = inject(CriarPessoaIdosaUseCase);
  private readonly atualizarUC = inject(AtualizarPessoaIdosaUseCase);
  private readonly ativarUC = inject(AtivarPessoaIdosaUseCase);
  private readonly inativarUC = inject(InativarPessoaIdosaUseCase);
  private readonly pdfService = inject(PdfService);

  obterTodos(filtros?: PessoaIdosaFiltros): Observable<PessoaIdosa[]> {
    return this.obterTodosUC.execute(filtros);
  }

  obterTodosPaginado(pagina: number, quantidadePorPagina: number, filtros?: PessoaIdosaFiltros) {
    return this.obterTodosPaginadoUC.execute(pagina, quantidadePorPagina, filtros);
  }

  obterPorId(id: string): Observable<PessoaIdosa | undefined> {
    return this.obterPorIdUC.execute(id);
  }

  async criar(props: CriarPessoaIdosaProps): Promise<string> {
    return this.criarUC.execute(props);
  }

  async atualizar(id: string, props: AtualizarPessoaIdosaProps): Promise<void> {
    await this.atualizarUC.execute(id, props);
  }

  async ativar(id: string): Promise<void> {
    await this.ativarUC.execute(id);
  }

  async inativar(id: string): Promise<void> {
    await this.inativarUC.execute(id);
  }

  gerarRelatorioListaPdf(pessoasIdosas: PessoaIdosa[]): void {
    const head = [['Nome', 'Data Nasc.', 'Estado Civíl', 'CPF', 'RG', 'CEP', 'Status' ]];
    const body = pessoasIdosas.map(p => [
      p.nome,
      formatDate(p.dataNascimento, 'dd/MM/yyyy', 'pt-BR'),
      p.estadoCivil,
      p.cpf,
      p.rg,
      p.endereco.cep,
      p.ativo ? 'Ativo' : 'Inativo'
    ]);

    this.pdfService.gerarPdfTabela('Relatório de Pessoas Idosas', 'relatorio-pessoas-idosas', head, body);
  }

  gerarRelatorioPdf(pessoaIdosa: PessoaIdosa): void {
    console.log(pessoaIdosa);
    const nomeArquivo = `relatorio-${pessoaIdosa.nome.toLowerCase().replace(/\s/g, '-')}.pdf`;
    const enderecoCompleto = `${pessoaIdosa.endereco.logradouro}, ${pessoaIdosa.endereco.numero} - ${pessoaIdosa.endereco.bairro}, ${pessoaIdosa.endereco.cidade}/${pessoaIdosa.endereco.estado}`;

    this.pdfService.gerarPdf({
      titulo: 'Relatório de Pessoa Idosa',
      nomeArquivo: nomeArquivo,
      head: [['Campo', 'Informação']],
      body: [
        ['Nome', pessoaIdosa.nome],
        ['Data de Nascimento', formatDate(pessoaIdosa.dataNascimento, 'dd/MM/yyyy', 'pt-BR')],
        ['CPF', pessoaIdosa.cpf],
        ['RG', pessoaIdosa.rg],
        ['Telefone', pessoaIdosa.telefone],
        ['Email', pessoaIdosa.email || 'Não informado'],
        ['Estado Civil', pessoaIdosa.estadoCivil],
        ['Naturalidade', pessoaIdosa.naturalidade],
        ['Endereço', enderecoCompleto],
        // Adicione outros campos conforme necessário
      ]
    });
  }
}