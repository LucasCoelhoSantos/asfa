import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface Credenciais {
  email: string;
  senha: string;
}

export interface Identidade {
  uid: string;
}

export const AUTH_PORT = new InjectionToken<AuthPort>('AUTH_PORT');

export interface AuthPort {
  readonly identidade$: Observable<Identidade | null>;

  entrar(credenciais: Credenciais): Observable<Identidade>;
  
  sair(): Observable<void>;
}