import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';
import { AuthPort, AUTH_PORT } from '../ports/auth.port';
import { UsuarioSessao } from '../domain/entities/usuario-sessao.entity';
import { USUARIO_REPOSITORY, UsuarioRepository } from '../../domains/usuario/domain/repositories/usuario.repository';
import { CargoUsuario } from '../../domains/usuario/domain/value-objects/enums';

@Injectable({ providedIn: 'root' })
export class SessaoService {
  private authPort = inject(AUTH_PORT);
  private usuarioRepository = inject(USUARIO_REPOSITORY);

  public readonly usuario$: Observable<UsuarioSessao | null> = this.authPort.identidade$.pipe(
    switchMap(identidade => {
      if (!identidade) {
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
        if (!usuario || !usuario.cargo) return false;
        return cargos.includes(usuario.cargo);
      })
    );
  }

  public entrar(email: string, senha: string): Observable<UsuarioSessao> {
    return this.authPort.entrar({ email, senha }).pipe(
      switchMap(identidade => this.usuarioRepository.obterPorId(identidade.uid)),
      map(usuario => {
        if (!usuario) throw new Error('Usuário não encontrado após o login.');
        return {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          cargo: usuario.cargo,
        };
      })
    );
  }
  
  public sair(): Observable<void> {
    return this.authPort.sair();
  }
}