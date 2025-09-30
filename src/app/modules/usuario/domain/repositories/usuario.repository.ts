import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../entities/usuario.entity';

export interface CriarUsuarioInput {
  nome: string;
  email: string;
  cargo: any;
  ativo: boolean;
  senha: string;
}

export abstract class UsuarioRepository {
  abstract listar(): Observable<Usuario[]>;
  abstract obterPorId(id: string): Observable<Usuario | undefined>;
  abstract criar(input: CriarUsuarioInput): Promise<string>;
  abstract atualizarPerfil(parcial: Partial<Usuario>): Promise<void>;
  abstract atualizarPorId(id: string, parcial: Partial<Usuario>): Promise<void>;
  abstract setAtivo(id: string, ativo: boolean): Promise<void>;
}

export const USUARIO_REPOSITORY = new InjectionToken<UsuarioRepository>('USUARIO_REPOSITORY');