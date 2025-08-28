import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <!-- Título e descrição -->
      <div>
        <h1 class="h2 mb-1 text-primary">{{ title }}</h1>
        <p *ngIf="description" class="text-muted mb-0">{{ description }}</p>
      </div>
      
      <!-- Ações -->
      <div class="d-flex gap-2" *ngIf="showActions">
        <ng-content select="[slot=actions]"></ng-content>
        
        <!-- Botão padrão de adicionar -->
        <button 
          *ngIf="showAddButton"
          class="btn btn-primary" 
          (click)="onAddClick()">
          <i class="bi bi-plus-circle me-2"></i>
          {{ addButtonText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .h2 {
      font-weight: 600;
      color: #0d6efd;
    }
    
    .text-muted {
      color: #6c757d !important;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() showActions: boolean = true;
  @Input() showAddButton: boolean = false;
  @Input() addButtonText: string = 'Adicionar';
  
  @Output() addClick = new EventEmitter<void>();

  onAddClick() {
    this.addClick.emit();
  }
}
