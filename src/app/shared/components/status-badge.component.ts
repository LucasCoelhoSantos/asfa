import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatusConfig {
  value: any;
  label: string;
  class: string;
  icon?: string;
}

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      <i *ngIf="statusConfig?.icon" [class]="statusConfig!.icon + ' me-1'"></i>
      {{ statusConfig?.label || value }}
    </span>
  `,
  styles: [`
    .badge {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.5em 0.75em;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() value: any;
  @Input() statusConfigs: StatusConfig[] = [];
  @Input() defaultClass: string = 'bg-primary';

  get statusConfig(): StatusConfig | undefined {
    return this.statusConfigs.find(config => config.value === this.value);
  }

  get badgeClass(): string {
    return this.statusConfig?.class || this.defaultClass;
  }
}
