import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IAutenticacaoRepository } from '../domain/repositories/iautenticacao.repository';

@Injectable({ providedIn: 'root' })
export class AutenticacaoFacade {
  private repository = inject(IAutenticacaoRepository);

  readonly usuario$ = this.repository.usuarioLogado$;
  readonly usuarioComCargo$ = this.repository.usuarioComCargo$;

  entrar(email: string, senha: string): Promise<any> {
    return this.repository.entrarComEmailESenha(email, senha);
  }

  sair(): Observable<void> {
    return this.repository.sair();
  }
}