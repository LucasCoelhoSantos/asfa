import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PessoaIdosa, CriarPessoaIdosaProps, AtualizarPessoaIdosaProps } from '../domain/entities/pessoa-idosa.entity';
import { PessoaIdosaListFilters, PessoaIdosaListPage } from '../domain/repositories/pessoa-idosa.repository';
import {
  ListarPessoasIdosasUseCase,
  ObterPessoaIdosaPorIdUseCase,
  CriarPessoaIdosaUseCase,
  AtualizarPessoaIdosaUseCase,
  AtivarPessoaIdosaUseCase,
  InativarPessoaIdosaUseCase,
  PaginarPessoasIdosasUseCase
} from './use-cases';

@Injectable({ providedIn: 'root' })
export class PessoaIdosaFacade {
  private readonly listarUC = inject(ListarPessoasIdosasUseCase);
  private readonly obterPorIdUC = inject(ObterPessoaIdosaPorIdUseCase);
  private readonly criarUC = inject(CriarPessoaIdosaUseCase);
  private readonly atualizarUC = inject(AtualizarPessoaIdosaUseCase);
  private readonly ativarUC = inject(AtivarPessoaIdosaUseCase);
  private readonly inativarUC = inject(InativarPessoaIdosaUseCase);
  private readonly paginarUC = inject(PaginarPessoasIdosasUseCase);

  private readonly pageSubject = new BehaviorSubject<PessoaIdosaListPage>({ pessoas: [], cursor: null, total: 0, temMais: false });
  readonly page$ = this.pageSubject.asObservable();

  listar(filtros: PessoaIdosaListFilters): Observable<PessoaIdosa[]> {
    return this.listarUC.execute(filtros);
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

  async carregarPagina(tamanho: number, cursor: unknown | null, filtros: PessoaIdosaListFilters): Promise<void> {
    const page = await this.paginarUC.execute(tamanho, cursor, filtros);
    this.pageSubject.next(page);
  }
}