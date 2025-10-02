import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { USUARIO_REPOSITORY, UsuarioListFilters } from '../../domain/repositories/usuario.repository';
import { Usuario, CriarUsuarioProps, AtualizarDadosAdminProps, AtualizarPerfilProps } from '../../domain/entities/usuario.entity';

@Injectable({ providedIn: 'root' })
export class ListarUsuariosUseCase {
  private repository = inject(USUARIO_REPOSITORY);
  execute(filtros: UsuarioListFilters): Observable<Usuario[]> {
    return this.repository.listar(filtros);
  }
}

@Injectable({ providedIn: 'root' })
export class ObterUsuarioPorIdUseCase {
  private repository = inject(USUARIO_REPOSITORY);
  execute(id: string): Observable<Usuario | undefined> {
    return this.repository.obterPorId(id);
  }
}

@Injectable({ providedIn: 'root' })
export class CriarUsuarioUseCase {
  private repository = inject(USUARIO_REPOSITORY);
  execute(props: CriarUsuarioProps): Promise<string> {
    const usuario = Usuario.criar(props);
    return lastValueFrom(this.repository.criar(usuario));
  }
}

@Injectable({ providedIn: 'root' })
export class AtualizarUsuarioUseCase {
  private repository = inject(USUARIO_REPOSITORY);
  execute(id: string, props: AtualizarDadosAdminProps): Promise<void> {
    return lastValueFrom(
      this.repository.obterPorId(id).pipe(
        switchMap(usuario => {
          if (!usuario) {
            throw new Error('Usuário não encontrado.');
          }
          usuario.atualizarDadosAdministrativos(props);
          return this.repository.atualizar(usuario);
        })
      )
    );
  }
}

@Injectable({ providedIn: 'root' })
export class AtualizarPerfilUseCase {
  private repository = inject(USUARIO_REPOSITORY);
  execute(id: string, props: AtualizarPerfilProps): Promise<void> {
    return lastValueFrom(
      this.repository.obterPorId(id).pipe(
        switchMap(usuario => {
          if (!usuario) {
            throw new Error('Usuário não encontrado.');
          }
          usuario.atualizarPerfil(props);
          return this.repository.atualizar(usuario);
        })
      )
    );
  }
}

@Injectable({ providedIn: 'root' })
export class AtivarUsuarioUseCase {
  private repository = inject(USUARIO_REPOSITORY);
  execute(id: string): Promise<void> {
    return lastValueFrom(
      this.repository.obterPorId(id).pipe(
        switchMap(usuario => {
          if (!usuario) {
            throw new Error('Usuário não encontrado.');
          }
          usuario.ativar();
          return this.repository.atualizar(usuario);
        })
      )
    );
  }
}

@Injectable({ providedIn: 'root' })
export class InativarUsuarioUseCase {
  private repository = inject(USUARIO_REPOSITORY);
  execute(id: string): Promise<void> {
    return lastValueFrom(
      this.repository.obterPorId(id).pipe(
        switchMap(usuario => {
          if (!usuario) {
            throw new Error('Usuário não encontrado.');
          }
          usuario.inativar();
          return this.repository.atualizar(usuario);
        })
      )
    );
  }
}