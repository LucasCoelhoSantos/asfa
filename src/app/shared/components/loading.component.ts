import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [ngClass]="containerClass">
      <!-- Spinner -->
      <div class="loading-spinner" [ngClass]="spinnerClass">
        <div class="spinner-border" [ngClass]="spinnerSizeClass" role="status">
          <span class="visually-hidden">{{ loadingText }}</span>
        </div>
      </div>
      
      <!-- Texto de loading -->
      <div *ngIf="showText" class="loading-text mt-3">
        <p class="text-muted mb-0">{{ loadingText }}</p>
        <p *ngIf="subText" class="text-muted small mb-0">{{ subText }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .loading-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.9);
      z-index: 9999;
    }
    
    .loading-container.inline {
      padding: 1rem;
    }
    
    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .loading-text {
      text-align: center;
    }
    
    .spinner-border {
      color: #0d6efd;
    }
  `]
})
export class LoadingComponent {
  @Input() loadingText: string = 'Carregando...';
  @Input() subText: string = '';
  @Input() showText: boolean = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'inline' | 'fullscreen' | 'default' = 'default';
  
  get containerClass(): string {
    switch (this.variant) {
      case 'fullscreen': return 'fullscreen';
      case 'inline': return 'inline';
      default: return '';
    }
  }
  
  get spinnerClass(): string {
    return this.variant === 'inline' ? 'small' : '';
  }
  
  get spinnerSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'spinner-border-sm';
      case 'lg': return 'spinner-border-lg';
      default: return '';
    }
  }
}
