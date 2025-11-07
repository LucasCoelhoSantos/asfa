import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
    ObterTodosUsuariosUseCase,
    ObterUsuarioPorIdUseCase,
    CriarUsuarioUseCase,
    AtualizarUsuarioUseCase,
    AtualizarPerfilUseCase,
    AtivarUsuarioUseCase,
    InativarUsuarioUseCase,
    ObterTodosUsuariosPaginadoUseCase
} from './use-cases/usuario.use-cases';
import { Usuario, CriarUsuarioProps, AtualizarUsuarioProps, AtualizarPerfilProps } from '../domain/entities/usuario.entity';
import { UsuarioListFiltros, UsuarioListaPaginada } from '../domain/repositories/usuario.repository';

@Injectable({ providedIn: 'root' })
export class UsuarioFacade {
  private readonly obterTodosUC = inject(ObterTodosUsuariosUseCase);
  private readonly obterTodosPaginadoUC = inject(ObterTodosUsuariosPaginadoUseCase);
  private readonly obterPorIdUC = inject(ObterUsuarioPorIdUseCase);
  private readonly criarUC = inject(CriarUsuarioUseCase);
  private readonly atualizarPerfilUC = inject(AtualizarPerfilUseCase);
  private readonly atualizarUsuarioUC = inject(AtualizarUsuarioUseCase);
  private readonly ativarUC = inject(AtivarUsuarioUseCase);
  private readonly inativarUC = inject(InativarUsuarioUseCase);

  obterTodos(): Observable<Usuario[]> {
    return this.obterTodosUC.execute();
  }

  obterTodosPaginado(pagina: number, quantidadePorPagina: number, filtros?: UsuarioListFiltros): Promise<UsuarioListaPaginada> {
    return this.obterTodosPaginadoUC.execute(pagina, quantidadePorPagina, filtros);
  }

  obterPorId(id: string): Observable<Usuario | undefined> {
    return this.obterPorIdUC.execute(id);
  }

  criar(props: CriarUsuarioProps): Promise<string> {
    return this.criarUC.execute(props);
  }

  atualizarPerfil(id: string, props: AtualizarPerfilProps): Promise<void> {
    return this.atualizarPerfilUC.execute(id, props);
  }

  atualizarUsuario(id: string, props: AtualizarUsuarioProps): Promise<void> {
    return this.atualizarUsuarioUC.execute(id, props);
  }

  ativar(id: string): Promise<void> {
    return this.ativarUC.execute(id);
  }

  inativar(id: string): Promise<void> {
    return this.inativarUC.execute(id);
  }
}