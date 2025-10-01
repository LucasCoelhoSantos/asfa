import { Injectable, inject } from '@angular/core';
import { Auth, User, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IAutenticacaoRepository } from '../domain/repositories/iautenticacao.repository';
import { Usuario } from '../../usuario/domain/entities/usuario.entity';
import { USUARIO_REPOSITORY } from '../../usuario/domain/repositories/usuario.repository';

@Injectable()
export class AutenticacaoFirebaseRepository implements IAutenticacaoRepository {
  private auth: Auth = inject(Auth);
  private usuarioRepository = inject(USUARIO_REPOSITORY);
  
  readonly usuarioLogado$: Observable<User | null> = user(this.auth);
  
  readonly usuarioComCargo$: Observable<(Usuario & { cargo?: string }) | null> = this.usuarioLogado$.pipe(
    switchMap(user => {
      if (!user?.email) return of(null);
      return this.usuarioRepository.obterPorEmail(user.email);
    })
  );

  entrarComEmailESenha(email: string, senha: string): Promise<any> {
    return signInWithEmailAndPassword(this.auth, email, senha);
  }

  sair(): Observable<void> {
    return from(signOut(this.auth));
  }
}