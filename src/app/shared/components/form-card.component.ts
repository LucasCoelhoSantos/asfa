import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card shadow-sm mb-4">
      <div class="card-header" [ngClass]="headerClass">
        <h5 class="card-title mb-0">
          <i [class]="icon + ' me-2'"></i>
          {{ title }}
        </h5>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card-header {
      border-bottom: 1px solid rgba(0,0,0,.125);
    }
  `]
})
export class FormCardComponent {
  @Input() title: string = '';
  @Input() icon: string = 'bi bi-card-text';
  @Input() headerClass: string = 'bg-primary text-white';
}
