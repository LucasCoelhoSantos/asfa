import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../../modules/usuario/domain/entities/usuario.entity';
import { USUARIO_REPOSITORY } from '../../modules/usuario/domain/repositories/usuario.repository';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private repo = inject(USUARIO_REPOSITORY);

  obterTodos(): Observable<Usuario[]> {
    return this.repo.listar();
  }

  obterPorId(id: string): Observable<Usuario | undefined> {
    return this.repo.obterPorId(id);
  }

  async criar(usuario: Omit<Usuario, 'id'>, senha: string): Promise<void> {
    await this.repo.criar({ ...usuario, senha });
  }

  async editarPerfil(usuario: Partial<Usuario>): Promise<void> {
    await this.repo.atualizarPerfil(usuario);
  }

  async editar(id: string, usuario: Partial<Usuario>): Promise<void> {
    await this.repo.atualizarPorId(id, usuario);
  }

  async setarAtivo(id: string, ativo: boolean): Promise<void> {
    await this.repo.setAtivo(id, ativo);
  }
}