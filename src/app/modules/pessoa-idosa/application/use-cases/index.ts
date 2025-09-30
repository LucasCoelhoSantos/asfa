import { inject, Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
function asObservable<T>(value: Observable<T> | Promise<T>): Observable<T> {
  return (value as any)?.subscribe ? (value as Observable<T>) : from(value as Promise<T>);
}

import { PessoaIdosa } from '../../domain/entities/pessoa-idosa.entity';
import { PessoaIdosaListFilters, PessoaIdosaListPage, PESSOA_IDOSA_REPOSITORY } from '../../domain/repositories/pessoa-idosa.repository';

@Injectable()
export class ListarPessoasIdosasUseCase {
  private readonly repo = inject(PESSOA_IDOSA_REPOSITORY);
  execute(filtros: PessoaIdosaListFilters): Observable<PessoaIdosa[]> {
    return this.repo.listar(filtros);
  }
}

@Injectable()
export class ObterPessoaIdosaPorIdUseCase {
  private readonly repo = inject(PESSOA_IDOSA_REPOSITORY);
  execute(id: string): Observable<PessoaIdosa | undefined> {
    return this.repo.obterPorId(id);
  }
}

@Injectable()
export class CriarPessoaIdosaUseCase {
  private readonly repo = inject(PESSOA_IDOSA_REPOSITORY);
  execute(pessoa: PessoaIdosa): Observable<string> {
    return asObservable(this.repo.criar(pessoa));
  }
}

@Injectable()
export class AtualizarPessoaIdosaUseCase {
  private readonly repo = inject(PESSOA_IDOSA_REPOSITORY);
  execute(id: string, pessoa: Partial<PessoaIdosa>): Observable<void> {
    return asObservable(this.repo.atualizar(id, pessoa));
  }
}

@Injectable()
export class AtivarPessoaIdosaUseCase {
  private readonly repo = inject(PESSOA_IDOSA_REPOSITORY);
  execute(id: string): Observable<void> {
    return asObservable(this.repo.ativar(id));
  }
}

@Injectable()
export class InativarPessoaIdosaUseCase {
  private readonly repo = inject(PESSOA_IDOSA_REPOSITORY);
  execute(id: string): Observable<void> {
    return asObservable(this.repo.inativar(id));
  }
}

@Injectable()
export class PaginarPessoasIdosasUseCase {
  private readonly repo = inject(PESSOA_IDOSA_REPOSITORY);
  execute(tamanho: number, cursor: unknown | null, filtros: PessoaIdosaListFilters): Promise<PessoaIdosaListPage> {
    return this.repo.paginar(tamanho, cursor, filtros);
  }
}
