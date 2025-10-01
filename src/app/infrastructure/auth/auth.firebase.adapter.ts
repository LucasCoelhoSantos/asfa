import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthPort, Credenciais, Identidade } from '../../core/ports/auth.port';

@Injectable()
export class AuthFirebaseAdapter implements AuthPort {
  private auth = inject(Auth);

  readonly identidade$: Observable<Identidade | null> = new Observable((subscriber) => {
    const unsubscriber = onAuthStateChanged(
      this.auth,
      (firebaseUser: User | null) => {
        if (firebaseUser) {
          subscriber.next({ uid: firebaseUser.uid });
        } else {
          subscriber.next(null);
        }
      },
      (erro) => subscriber.error(erro)
    );
    // Função de limpeza para quando o Observable for desinscrito
    return () => unsubscriber();
  });

  entrar(credenciais: Credenciais): Observable<Identidade> {
    return from(signInWithEmailAndPassword(this.auth, credenciais.email, credenciais.senha)).pipe(
      map(userCredential => {
        if (!userCredential.user) {
            throw new Error('Falha no login: credenciais de usuário inválidas.');
        }
        return { uid: userCredential.user.uid };
      })
    );
  }
  
  sair(): Observable<void> {
    return from(signOut(this.auth));
  }
}