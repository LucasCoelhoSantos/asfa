import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = signal<Notification[]>([]);

  getNotifications() {
    return this.notifications.asReadonly();
  }

  showSuccess(message: string, duration: number = 5000) {
    this.addNotification(message, 'success', duration);
  }

  showError(message: string, duration: number = 7000) {
    this.addNotification(message, 'error', duration);
  }

  showWarning(message: string, duration: number = 5000) {
    this.addNotification(message, 'warning', duration);
  }

  showInfo(message: string, duration: number = 4000) {
    this.addNotification(message, 'info', duration);
  }

  private addNotification(message: string, type: Notification['type'], duration: number) {
    const id = this.generateNotificationId();
    const notification: Notification = { id, message, type, duration };
    
    this.notifications.update(notifications => [...notifications, notification]);
    
    if (duration > 0) {
      this.scheduleNotificationRemoval(id, duration);
    }
  }

  private generateNotificationId(): string {
    return Date.now().toString();
  }

  private scheduleNotificationRemoval(id: string, duration: number): void {
    setTimeout(() => this.removeNotification(id), duration);
  }

  removeNotification(id: string) {
    this.notifications.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  clearAll() {
    this.notifications.set([]);
  }
} 