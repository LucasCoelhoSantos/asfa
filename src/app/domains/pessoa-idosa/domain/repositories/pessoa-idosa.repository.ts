import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PessoaIdosa } from '../entities/pessoa-idosa.entity';
import { Aposentado, Beneficio, Deficiencia, Escolaridade, TipoFormacaoProfissional, Moradia, ProblemaDeSaude, SituacaoOcupacional } from '../value-objects/enums';

export interface PessoaIdosaFiltros {
  nome?: string;
  dataNascimento?: string;
  estadoCivil?: string;
  cpf?: string;
  rg?: string;
  cep?: string;
  alfabetizado?: boolean;
  estudaAtualmente?: boolean;
  nivelSerieAtual?: Escolaridade;
  cursoFormacao?: TipoFormacaoProfissional;
  beneficio?: Beneficio;
  situacaoOcupacional?: SituacaoOcupacional;
  problemaDeSaude?: ProblemaDeSaude;
  aposentado?: Aposentado;
  moradia?: Moradia;
  deficiencia?: Deficiencia;
  ativo?: 'ativo' | 'inativo';
}

export interface PessoaIdosaListaPaginada {
  pessoasIdosas: PessoaIdosa[];
  paginaAtual: number;
  quantidadePorPagina: number;
  total: number;
}

export const PESSOA_IDOSA_REPOSITORY = new InjectionToken<PessoaIdosaRepository>('PESSOA_IDOSA_REPOSITORY');

export interface PessoaIdosaRepository {
  obterTodos(filtros?: PessoaIdosaFiltros): Observable<PessoaIdosa[]>;
  obterTodosPaginado(pagina: number, quantidadePorPagina: number, filtros?: PessoaIdosaFiltros): Promise<PessoaIdosaListaPaginada>;
  obterPorId(id: string): Observable<PessoaIdosa | undefined>;
  criar(pessoa: PessoaIdosa): Observable<string>;
  atualizar(pessoa: PessoaIdosa): Observable<void>;
}