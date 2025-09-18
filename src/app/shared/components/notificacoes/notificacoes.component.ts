import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacaoService } from '../../../core/services/notificacao.service';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 9999;">
      <div 
        *ngFor="let notificacao of notificacoes()"
        class="toast show"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        (click)="removeNotificacao(notificacao.id)"
        style="cursor: pointer; min-width: 300px; max-width: 400px;"
      >
        <div class="toast-header" [class]="'bg-' + getBootstrapClass(notificacao.tipo) + ' text-white'">
          <strong class="me-auto">{{ getNotificationTitle(notificacao.tipo) }}</strong>
          <button type="button" class="btn-close btn-close-white" (click)="removeNotificacao(notificacao.id)" aria-label="Fechar"></button>
        </div>
        <div class="toast-body">
          {{ notificacao.mensagem }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      margin-bottom: 0.5rem;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .bg-success {
      background-color: #198754 !important;
    }

    .bg-danger {
      background-color: #dc3545 !important;
    }

    .bg-warning {
      background-color: #ffc107 !important;
    }

    .bg-info {
      background-color: #0dcaf0 !important;
    }
  `]
})
export class NotificacoesComponent {
  notificacaoService = inject(NotificacaoService);
  notificacoes = this.notificacaoService.obterNotificacoes();

  removeNotificacao(id: string) {
    this.notificacaoService.removerNotificacao(id);
  }

  getBootstrapClass(type: string): string {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  getNotificationTitle(type: string): string {
    switch (type) {
      case 'success': return 'Sucesso';
      case 'error': return 'Erro';
      case 'warning': return 'Aviso';
      case 'info': return 'Informação';
      default: return 'Notificação';
    }
  }
}