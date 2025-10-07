import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PessoaIdosa, CriarPessoaIdosaProps, AtualizarPessoaIdosaProps } from '../../domain/entities/pessoa-idosa.entity';
import { PessoaIdosaFiltros, PessoaIdosaListaPaginada, PESSOA_IDOSA_REPOSITORY } from '../../domain/repositories/pessoa-idosa.repository';

@Injectable({ providedIn: 'root' })
export class ObterTodasPessoasIdosasUseCase {
  private repository = inject(PESSOA_IDOSA_REPOSITORY);
  execute(filtros?: PessoaIdosaFiltros): Observable<PessoaIdosa[]> {
    return this.repository.obterTodos(filtros);
  }
}

@Injectable({ providedIn: 'root' })
export class ObterTodasPessoasIdosasPaginadoUseCase {
  private repository = inject(PESSOA_IDOSA_REPOSITORY);
  execute(pagina: number, quantidadePorPagina: number, filtros?: PessoaIdosaFiltros): Promise<PessoaIdosaListaPaginada> {
    return this.repository.obterTodosPaginado(pagina, quantidadePorPagina, filtros);
  }
}

@Injectable({ providedIn: 'root' })
export class ObterPessoaIdosaPorIdUseCase {
  private repository = inject(PESSOA_IDOSA_REPOSITORY);
  execute(id: string): Observable<PessoaIdosa | undefined> {
    return this.repository.obterPorId(id);
  }
}

@Injectable({ providedIn: 'root' })
export class CriarPessoaIdosaUseCase {
  private repository = inject(PESSOA_IDOSA_REPOSITORY);
  execute(props: CriarPessoaIdosaProps): Promise<string> {
    const pessoaIdosa = PessoaIdosa.criar(props);
    return lastValueFrom(this.repository.criar(pessoaIdosa));
  }
}

@Injectable({ providedIn: 'root' })
export class AtualizarPessoaIdosaUseCase {
  private repository = inject(PESSOA_IDOSA_REPOSITORY);
  execute(id: string, props: AtualizarPessoaIdosaProps): Promise<void> {
    return lastValueFrom(
      this.repository.obterPorId(id).pipe(
        switchMap(pessoa => {
          if (!pessoa) {
            throw new Error('Pessoa idosa não encontrada.');
          }
          pessoa.atualizarDados(props);
          return this.repository.atualizar(pessoa);
        })
      )
    );
  }
}

@Injectable({ providedIn: 'root' })
export class AtivarPessoaIdosaUseCase {
  private repository = inject(PESSOA_IDOSA_REPOSITORY);
  execute(id: string): Promise<void> {
    return lastValueFrom(
      this.repository.obterPorId(id).pipe(
        switchMap(pessoa => {
          if (!pessoa) {
            throw new Error('Pessoa idosa não encontrada.');
          }
          pessoa.ativar();
          return this.repository.atualizar(pessoa);
        })
      )
    );
  }
}

@Injectable({ providedIn: 'root' })
export class InativarPessoaIdosaUseCase {
  private repository = inject(PESSOA_IDOSA_REPOSITORY);
  execute(id: string): Promise<void> {
    return lastValueFrom(
      this.repository.obterPorId(id).pipe(
        switchMap(pessoa => {
          if (!pessoa) {
            throw new Error('Pessoa idosa não encontrada.');
          }
          pessoa.inativar();
          return this.repository.atualizar(pessoa);
        })
      )
    );
  }
}