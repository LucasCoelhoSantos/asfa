import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { from, Observable, map, switchMap, of } from 'rxjs';
import { Usuario } from '../../models/usuario.model';

/**
 * Serviço de autenticação centralizado usando AngularFireAuth.
 * Fornece métodos para login, logout, observáveis de usuário e estado de autenticação.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  /**
   * Observable do usuário autenticado (User | null)
   */
  user$: Observable<User | null> = new Observable((subscriber) => {
    return onAuthStateChanged(this.auth, subscriber);
  });

  /**
   * Observable booleano indicando se há usuário autenticado
   */
  isLoggedIn$: Observable<boolean> = this.user$.pipe(map(user => !!user));

  /**
   * Observable do usuário autenticado com dados do Firestore (inclui role)
   */
  userWithRole$: Observable<Usuario | null> = this.user$.pipe(
    switchMap(user => {
      if (!user) return of(null);
      const docRef = doc(this.firestore, 'usuarios', user.uid);
      return docData(docRef, { idField: 'id' }) as Observable<Usuario>;
    })
  );

  /**
   * Realiza login com e-mail e senha
   * @param email E-mail do usuário
   * @param password Senha do usuário
   * @returns Observable<User>
   */
  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(cred => cred.user)
    );
  }

  /**
   * Realiza logout do usuário autenticado
   * @returns Observable<void>
   */
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  /**
   * Retorna o usuário autenticado atual (ou null)
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Opcional: registro de usuário
  // register(email: string, password: string): Observable<User> {
  //   return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
  //     map(cred => cred.user)
  //   );
  // }
}