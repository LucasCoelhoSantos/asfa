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

  obterTodos(): Observable<PessoaIdosa[]> {
    return this.obterTodosUC.execute();
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
      p.composicaoFamiliar.estadoCivil,
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

    // Seção principal (Pessoa Idosa)
    const secoes: any[] = [
      {
        titulo: 'Informações Pessoais',
        head: [['Campo', 'Informação']],
        body: [
          ['Nome', pessoaIdosa.nome],
          ['Data de Cadastro', formatDate(pessoaIdosa.dataCadastro, 'dd/MM/yyyy', 'pt-BR')],
          ['Data de Nascimento', formatDate(pessoaIdosa.dataNascimento, 'dd/MM/yyyy', 'pt-BR')],
          ['CPF', pessoaIdosa.cpf],
          ['RG', pessoaIdosa.rg],
          ['Órgão Emissor', pessoaIdosa.orgaoEmissor],
          ['Telefone', pessoaIdosa.telefone],
          ['Email', pessoaIdosa.email || 'Não informado'],
          ['Estado Civil', pessoaIdosa.composicaoFamiliar.estadoCivil],
          ['Religião', pessoaIdosa.religiao],
          ['Naturalidade', pessoaIdosa.naturalidade],
          ['Endereço', enderecoCompleto],
          ['CEP', pessoaIdosa.endereco.cep],
          ['Moradia', pessoaIdosa.endereco.moradia],
          ['Número', String(pessoaIdosa.endereco.numero ?? '—')],
          ['Bairro', pessoaIdosa.endereco.bairro],
          ['Cidade/Estado', `${pessoaIdosa.endereco.cidade}/${pessoaIdosa.endereco.estado}`],
          ['Prontuário de Saúde', pessoaIdosa.prontuarioSaude],
          ['Aposentado se mantém com a renda?', pessoaIdosa.aposentadoConsegueSeManterComSuaRenda ? 'Sim' : 'Não'],
          ['Como complementa a renda', pessoaIdosa.comoComplementa || '—'],
          ['Benefício', pessoaIdosa.beneficio],
          ['Observação', pessoaIdosa.observacao || '—'],
          ['Histórico Familiar/Social', pessoaIdosa.historicoFamiliarSocial || '—'],
          ['Status', pessoaIdosa.ativo ? 'Ativo' : 'Inativo'],
          ['Alfabetizado', pessoaIdosa.composicaoFamiliar.alfabetizado ? 'Sim' : 'Não'],
          ['Estuda atualmente', pessoaIdosa.composicaoFamiliar.estudaAtualmente ? 'Sim' : 'Não'],
          ['Nível/Série Atual Concluído', pessoaIdosa.composicaoFamiliar.nivelSerieAtualConcluido],
          ['Curso Técnico/Formação Profissional', pessoaIdosa.composicaoFamiliar.cursosTecnicoFormacaoProfissional],
          ['Situação Ocupacional', pessoaIdosa.composicaoFamiliar.situacaoOcupacional],
          ['Renda', pessoaIdosa.composicaoFamiliar.renda],
          ['Aposentado', pessoaIdosa.composicaoFamiliar.aposentado],
          ['Benefício (composição)', pessoaIdosa.composicaoFamiliar.beneficio],
          ['Deficiência', pessoaIdosa.composicaoFamiliar.deficiencia],
          ['Problema de Saúde', pessoaIdosa.composicaoFamiliar.problemaDeSaude],
          ['Faz Algum Tratamento', pessoaIdosa.composicaoFamiliar.fazAlgumTratamento ? 'Sim' : 'Não'],
          ['Onde Faz Tratamento', pessoaIdosa.composicaoFamiliar.fazAlgumTratamentoOnde || '—'],
          ['Usa Medicamento Controlado', pessoaIdosa.composicaoFamiliar.usaMedicamentoControlado ? 'Sim' : 'Não'],
          ['Usa Recursos da UBS local', pessoaIdosa.composicaoFamiliar.usaRecursosUbsLocal ? 'Sim' : 'Não'],
          ['Trabalho Pastoral/Social', pessoaIdosa.composicaoFamiliar.trabalhoPastoralOuSocial],
          ['Atividade na Comunidade Sagrada Família', pessoaIdosa.composicaoFamiliar.atividadeNaComunidadeSagradaFamilia],
          ['Trabalho Voluntário', pessoaIdosa.composicaoFamiliar.trabalhoVoluntario],
          ['Onde Deseja Trabalhar Voluntário', pessoaIdosa.composicaoFamiliar.trabalhoVoluntarioOnde || '—'],
          ['Quantidade de Dependentes', String(pessoaIdosa.dependentes.length)],
          ['Quantidade de Anexos', String(pessoaIdosa.anexos.length)]
        ]
      }
    ];

    // Seção dependentes
    pessoaIdosa.dependentes.forEach((dep, idx) => {
      const tituloDep = `Dependente ${idx + 1} — ${dep.nome}`;
      const bodyDep = [
        ['Nome', dep.nome],
        ['Data de Nascimento', formatDate(dep.dataNascimento, 'dd/MM/yyyy', 'pt-BR')],
        ['Parentesco', dep.parentesco],
        ['Ativo', dep.ativo ? 'Sim' : 'Não'],
        ['CEINF', dep.ceinf || '—'],
        ['CEINF Bairro', dep.ceinfBairro || '—'],
        ['Programa Saúde Pastoral Criança', dep.programaSaudePastoralCrianca || '—'],
        ['Local do Programa', dep.programaSaudePastoralCriancaLocal || '—'],
        // Composição familiar do dependente
        ['Estado Civil', dep.composicaoFamiliar.estadoCivil],
        ['Alfabetizado', dep.composicaoFamiliar.alfabetizado ? 'Sim' : 'Não'],
        ['Estuda atualmente', dep.composicaoFamiliar.estudaAtualmente ? 'Sim' : 'Não'],
        ['Nível/Série Atual Concluído', dep.composicaoFamiliar.nivelSerieAtualConcluido],
        ['Curso Técnico/Formação Profissional', dep.composicaoFamiliar.cursosTecnicoFormacaoProfissional],
        ['Situação Ocupacional', dep.composicaoFamiliar.situacaoOcupacional],
        ['Renda', dep.composicaoFamiliar.renda],
        ['Aposentado', dep.composicaoFamiliar.aposentado],
        ['Benefício (composição)', dep.composicaoFamiliar.beneficio],
        ['Deficiência', dep.composicaoFamiliar.deficiencia],
        ['Problema de Saúde', dep.composicaoFamiliar.problemaDeSaude],
        ['Faz Algum Tratamento', dep.composicaoFamiliar.fazAlgumTratamento ? 'Sim' : 'Não'],
        ['Onde Faz Tratamento', dep.composicaoFamiliar.fazAlgumTratamentoOnde || '—'],
        ['Usa Medicamento Controlado', dep.composicaoFamiliar.usaMedicamentoControlado ? 'Sim' : 'Não'],
        ['Usa Recursos da UBS local', dep.composicaoFamiliar.usaRecursosUbsLocal ? 'Sim' : 'Não'],
        ['Trabalho Pastoral/Social', dep.composicaoFamiliar.trabalhoPastoralOuSocial],
        ['Atividade na Comunidade Sagrada Família', dep.composicaoFamiliar.atividadeNaComunidadeSagradaFamilia],
        ['Trabalho Voluntário', dep.composicaoFamiliar.trabalhoVoluntario],
        ['Onde Deseja Trabalhar Voluntário', dep.composicaoFamiliar.trabalhoVoluntarioOnde || '—']
      ];
      secoes.push({ titulo: tituloDep, head: [['Campo', 'Informação']], body: bodyDep, novaPagina: true });
    });

    // Seção anexos
    pessoaIdosa.anexos.forEach((ane, idx) => {
      const tituloAne = `Anexo ${idx + 1} - ${ane.categoria}`;
      const bodyAne = [
        ['Path', ane.path],
        ['URL', ane.url]
      ];
      secoes.push({ titulo: tituloAne, head: [['Campo', 'Informação']], body: bodyAne, novaPagina: true});
    });

    this.pdfService.gerarPdfComSecoes({
      titulo: 'Ficha de Pessoa Idosa',
      nomeArquivo: nomeArquivo,
      secoes
    });
  }
}