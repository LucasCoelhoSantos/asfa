import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../entities/usuario.entity';
import { CargoUsuario } from '../value-objects/enums';

export interface UsuarioListFiltros {
  nome?: string;
  email?: string;
  cargo?: CargoUsuario;
  status?: boolean;
}

export interface UsuarioListaPaginada {
  usuarios: Usuario[];
  paginaAtual: number;
  quantidadePorPagina: number;
  total: number;
}

export const USUARIO_REPOSITORY = new InjectionToken<UsuarioRepository>('USUARIO_REPOSITORY');

export abstract class UsuarioRepository {
  abstract obterTodos(filtros: UsuarioListFiltros): Observable<Usuario[]>;
  abstract obterTodosPaginado(pagina: number, quantidadePorPagina: number, filtros?: UsuarioListFiltros): Promise<UsuarioListaPaginada>;
  abstract obterPorId(id: string): Observable<Usuario | undefined>;
  abstract obterPorEmail(email: string): Observable<Usuario | undefined>;
  abstract criar(usuario: Usuario): Observable<string>;
  abstract atualizar(usuario: Usuario): Observable<void>;
}