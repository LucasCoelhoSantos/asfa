import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { from, Observable, map, switchMap, of } from 'rxjs';
import { Usuario } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  user$: Observable<User | null> = new Observable((subscriber) => {
    return onAuthStateChanged(this.auth, subscriber);
  });

  isLoggedIn$: Observable<boolean> = this.user$.pipe(map(user => !!user));

  userWithRole$: Observable<Usuario | null> = this.user$.pipe(
    switchMap(user => {
      if (!user) return of(null);
      const docRef = doc(this.firestore, 'usuarios', user.uid);
      return docData(docRef, { idField: 'id' }) as Observable<Usuario>;
    })
  );

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(cred => cred.user)
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }
}