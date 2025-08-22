import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div 
        *ngFor="let notification of notifications()"
        class="notification"
        [class]="'notification--' + notification.type"
        (click)="removeNotification(notification.id)"
      >
        <div class="notification__content">
          <span class="notification__message">{{ notification.message }}</span>
          <button class="notification__close" (click)="removeNotification(notification.id)">
            ×
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 16px;
      min-width: 300px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid;
    }

    .notification--success {
      border-left-color: #4caf50;
    }

    .notification--error {
      border-left-color: #f44336;
    }

    .notification--warning {
      border-left-color: #ff9800;
    }

    .notification--info {
      border-left-color: #2196f3;
    }

    .notification__content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .notification__message {
      flex: 1;
      color: #333;
      font-size: 14px;
      line-height: 1.4;
    }

    .notification__close {
      background: none;
      border: none;
      font-size: 18px;
      color: #666;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .notification__close:hover {
      background-color: rgba(0, 0, 0, 0.1);
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
  `]
})
export class NotificationsComponent {
  notificationService = inject(NotificationService);
  notifications = this.notificationService.getNotifications();

  removeNotification(id: string) {
    this.notificationService.removeNotification(id);
  }
} 