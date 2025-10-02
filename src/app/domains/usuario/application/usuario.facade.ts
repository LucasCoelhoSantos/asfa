import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
    ListarUsuariosUseCase,
    ObterUsuarioPorIdUseCase,
    CriarUsuarioUseCase,
    AtualizarUsuarioUseCase,
    AtualizarPerfilUseCase,
    AtivarUsuarioUseCase,
    InativarUsuarioUseCase
} from './use-cases/usuario.use-cases';
import { Usuario, CriarUsuarioProps, AtualizarDadosAdminProps, AtualizarPerfilProps } from '../domain/entities/usuario.entity';
import { UsuarioListFilters } from '../domain/repositories/usuario.repository';

@Injectable({ providedIn: 'root' })
export class UsuarioFacade {
    private readonly listarUC = inject(ListarUsuariosUseCase);
    private readonly obterPorIdUC = inject(ObterUsuarioPorIdUseCase);
    private readonly criarUC = inject(CriarUsuarioUseCase);
    private readonly atualizarUsuarioUC = inject(AtualizarUsuarioUseCase);
    private readonly atualizarPerfilUC = inject(AtualizarPerfilUseCase);
    private readonly ativarUC = inject(AtivarUsuarioUseCase);
    private readonly inativarUC = inject(InativarUsuarioUseCase);

    listar(filtros: UsuarioListFilters): Observable<Usuario[]> {
        return this.listarUC.execute(filtros);
    }

    obterPorId(id: string): Observable<Usuario | undefined> {
        return this.obterPorIdUC.execute(id);
    }

    criar(props: CriarUsuarioProps): Promise<string> {
        return this.criarUC.execute(props);
    }

    atualizarUsuario(id: string, props: AtualizarDadosAdminProps): Promise<void> {
        return this.atualizarUsuarioUC.execute(id, props);
    }

    atualizarPerfil(id: string, props: AtualizarPerfilProps): Promise<void> {
        return this.atualizarPerfilUC.execute(id, props);
    }

    ativar(id: string): Promise<void> {
        return this.ativarUC.execute(id);
    }

    inativar(id: string): Promise<void> {
        return this.inativarUC.execute(id);
    }
}