import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';
import { AutenticacaoService } from './autenticacao.service';
import { UsuarioSessao } from '../domain/entities/usuario-sessao.entity';
import { USUARIO_REPOSITORY } from '../../domains/usuario/domain/repositories/usuario.repository';
import { CargoUsuario } from '../../domains/usuario/domain/value-objects/enums';

@Injectable({ providedIn: 'root' })
export class SessaoService {
  private autenticacaoService = inject(AutenticacaoService);
  private usuarioRepository = inject(USUARIO_REPOSITORY);

  public readonly usuario$: Observable<UsuarioSessao | null> = this.autenticacaoService.identidade$.pipe(
    switchMap(identidade => {
      if (!identidade?.uid) {
        return of(null);
      }
      return this.usuarioRepository.obterPorId(identidade.uid);
    }),
    map(usuario => {
      if (!usuario) return null;
      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      };
    }),
    shareReplay(1)
  );

  public readonly estaLogado$: Observable<boolean> = this.usuario$.pipe(
    map(user => !!user)
  );

  public temCargo(cargos: CargoUsuario[]): Observable<boolean> {
    return this.usuario$.pipe(
      map(usuario => {
        if (!usuario?.cargo) {
          return false;
        }
        return cargos.includes(usuario.cargo);
      })
    );
  }
}