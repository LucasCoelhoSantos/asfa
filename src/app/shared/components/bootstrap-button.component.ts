import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonType = 'button' | 'submit' | 'reset';
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info' | 'outline-light' | 'outline-dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-bootstrap-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type"
      class="btn"
      [ngClass]="buttonClasses"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)">
      
      <!-- Loading Spinner -->
      <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status">
        <span class="visually-hidden">Carregando...</span>
      </span>
      
      <!-- Icon -->
      <i *ngIf="icon && !loading" [class]="icon + ' me-2'"></i>
      
      <!-- Text -->
      <span>{{ loading ? loadingText : text }}</span>
    </button>
  `,
  styles: [`
    .btn {
      transition: all 0.2s ease-in-out;
    }
    
    .btn:focus {
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
    
    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  `]
})
export class BootstrapButtonComponent {
  @Input() type: ButtonType = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() text: string = '';
  @Input() loadingText: string = 'Carregando...';
  @Input() icon: string = '';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() block: boolean = false;
  @Input() rounded: boolean = false;
  
  @Output() onClick = new EventEmitter<Event>();

  get buttonClasses(): string {
    const classes = [`btn-${this.variant}`];
    
    if (this.size !== 'md') {
      classes.push(`btn-${this.size}`);
    }
    
    if (this.block) {
      classes.push('w-100');
    }
    
    if (this.rounded) {
      classes.push('rounded-pill');
    }
    
    return classes.join(' ');
  }
}
