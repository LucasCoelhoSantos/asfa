import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { AuthPort, AUTH_PORT, Credenciais, Identidade } from '../ports/auth.port';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService {
  private authPort: AuthPort = inject(AUTH_PORT);

  readonly identidade$: Observable<Identidade | null> = this.authPort.identidade$;

  entrar(credenciais: Credenciais): Observable<Identidade> {
    return from(this.authPort.entrar(credenciais));
  }

  sair(): Observable<void> {
    return from(this.authPort.sair());
  }
}