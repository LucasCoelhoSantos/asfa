import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { from, Observable, map, switchMap, of } from 'rxjs';
import { Usuario } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AutenticacaoService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  usuario$: Observable<User | null> = new Observable((subscriber) => {
    return onAuthStateChanged(this.auth, subscriber);
  });

  estaLogado$: Observable<boolean> = this.usuario$.pipe(map(user => !!user));

  usuarioComCargo$: Observable<Usuario | null> = this.usuario$.pipe(
    switchMap(user => {
      if (!user) return of(null);
      const docRef = doc(this.firestore, 'usuarios', user.uid);
      return docData(docRef, { idField: 'id' }) as Observable<Usuario>;
    })
  );

  entrar(email: string, senha: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, senha)).pipe(
      map(cred => cred.user)
    );
  }
  
  sair(): Observable<void> {
    return from(signOut(this.auth));
  }
}