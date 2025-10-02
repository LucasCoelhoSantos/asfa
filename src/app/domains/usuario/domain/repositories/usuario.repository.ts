import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../entities/usuario.entity';

export interface UsuarioListFilters {
  nome?: string;
  email?: string;
  ativo?: boolean;
}

export const USUARIO_REPOSITORY = new InjectionToken<UsuarioRepository>('USUARIO_REPOSITORY');

export abstract class UsuarioRepository {
  abstract listar(filtros: UsuarioListFilters): Observable<Usuario[]>;
  abstract obterPorId(id: string): Observable<Usuario | undefined>;
  abstract obterPorEmail(email: string): Observable<Usuario | undefined>;
  abstract criar(usuario: Usuario): Observable<string>;
  abstract atualizar(usuario: Usuario): Observable<void>;
}
