import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PessoaIdosa } from '../entities/pessoa-idosa.entity';

export interface PessoaIdosaListFilters {
  nome?: string;
  cpf?: string;
  estadoCivil?: string;
  ativo?: boolean;
  dataNascimento?: string;
  rg?: string;
  cep?: string;
}

export interface PessoaIdosaListPage {
  pessoas: PessoaIdosa[];
  cursor: unknown | null;
  total: number;
  temMais: boolean;
}

export const PESSOA_IDOSA_REPOSITORY = new InjectionToken<PessoaIdosaRepository>('PESSOA_IDOSA_REPOSITORY');

export interface PessoaIdosaRepository {
  listar(filtros: PessoaIdosaListFilters): Observable<PessoaIdosa[]>;
  obterPorId(id: string): Observable<PessoaIdosa | undefined>;
  criar(pessoa: PessoaIdosa): Observable<string>;
  atualizar(pessoa: PessoaIdosa): Observable<void>;
  paginar(tamanho: number, cursor: unknown | null, filtros: PessoaIdosaListFilters): Promise<PessoaIdosaListPage>;
}
