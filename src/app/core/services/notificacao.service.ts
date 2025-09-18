import { Injectable, signal } from '@angular/core';

export interface Notificacao {
  id: string;
  mensagem: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  duracao?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private notificacoes = signal<Notificacao[]>([]);

  obterNotificacoes() {
    return this.notificacoes.asReadonly();
  }

  mostrarSucesso(mensagem: string, duracao: number = 5000) {
    this.adicionarNotificacao(mensagem, 'success', duracao);
  }

  mostrarErro(mensagem: string, duracao: number = 7000) {
    this.adicionarNotificacao(mensagem, 'error', duracao);
  }

  mostrarAviso(mensagem: string, duracao: number = 5000) {
    this.adicionarNotificacao(mensagem, 'warning', duracao);
  }

  mostrarInformacao(mensagem: string, duracao: number = 4000) {
    this.adicionarNotificacao(mensagem, 'info', duracao);
  }

  private adicionarNotificacao(mensagem: string, tipo: Notificacao['tipo'], duracao: number) {
    const id = this.gerarNotificacaoId();
    const notificacao: Notificacao = { id, mensagem, tipo, duracao };
    
    this.notificacoes.update(notificacoes => [...notificacoes, notificacao]);
    
    if (duracao > 0) {
      this.scheduleNotificationRemoval(id, duracao);
    }
  }

  private gerarNotificacaoId(): string {
    return Date.now().toString();
  }

  private scheduleNotificationRemoval(id: string, duration: number): void {
    setTimeout(() => this.removerNotificacao(id), duration);
  }

  removerNotificacao(id: string) {
    this.notificacoes.update(notificacoes => notificacoes.filter(n => n.id !== id));
  }
  
  limparTudo() {
    this.notificacoes.set([]);
  }
}