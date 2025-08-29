import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 9999;">
      <div 
        *ngFor="let notification of notifications()"
        class="toast show"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        (click)="removeNotification(notification.id)"
        style="cursor: pointer; min-width: 300px; max-width: 400px;"
      >
        <div class="toast-header" [class]="'bg-' + getBootstrapClass(notification.type) + ' text-white'">
          <strong class="me-auto">{{ getNotificationTitle(notification.type) }}</strong>
          <button type="button" class="btn-close btn-close-white" (click)="removeNotification(notification.id)" aria-label="Fechar"></button>
        </div>
        <div class="toast-body">
          {{ notification.message }}
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
export class NotificationsComponent {
  notificationService = inject(NotificationService);
  notifications = this.notificationService.getNotifications();

  removeNotification(id: string) {
    this.notificationService.removeNotification(id);
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