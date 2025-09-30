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

export abstract class PessoaIdosaRepository {
  abstract listar(filtros: PessoaIdosaListFilters): Observable<PessoaIdosa[]>;
  abstract obterPorId(id: string): Observable<PessoaIdosa | undefined>;
  abstract criar(pessoa: PessoaIdosa): Promise<string> | Observable<string>;
  abstract atualizar(id: string, pessoa: Partial<PessoaIdosa>): Promise<void> | Observable<void>;
  abstract ativar(id: string): Promise<void> | Observable<void>;
  abstract inativar(id: string): Promise<void> | Observable<void>;
  abstract paginar(tamanho: number, cursor: unknown | null, filtros: PessoaIdosaListFilters): Promise<PessoaIdosaListPage>;
}

export const PESSOA_IDOSA_REPOSITORY = new InjectionToken<PessoaIdosaRepository>('PESSOA_IDOSA_REPOSITORY');
