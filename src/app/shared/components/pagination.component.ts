import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mt-4" *ngIf="total > 0">
      <!-- Informações da página -->
      <div class="text-muted">
        Mostrando {{ startItem }} a {{ endItem }} de {{ total }} registros
      </div>
      
      <!-- Navegação -->
      <nav *ngIf="pageSize > 0 && total > pageSize">
        <ul class="pagination pagination-sm mb-0">
          <!-- Botão Anterior -->
          <li class="page-item" [class.disabled]="currentPage === 1">
            <button 
              class="page-link" 
              (click)="onPageChange(currentPage - 1)" 
              [disabled]="currentPage === 1"
              title="Página anterior">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          
          <!-- Páginas -->
          <li 
            *ngFor="let page of visiblePages" 
            class="page-item"
            [class.active]="page === currentPage">
            <button 
              *ngIf="typeof page === 'number'"
              class="page-link" 
              (click)="onPageChange(page)">
              {{ page }}
            </button>
            <span *ngIf="typeof page === 'string'" class="page-link disabled">
              {{ page }}
            </span>
          </li>
          
          <!-- Botão Próximo -->
          <li class="page-item" [class.disabled]="currentPage === totalPages">
            <button 
              class="page-link" 
              (click)="onPageChange(currentPage + 1)" 
              [disabled]="currentPage === totalPages"
              title="Próxima página">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: [`
    .pagination .page-link {
      border-radius: 0.375rem;
      margin: 0 2px;
    }
    
    .pagination .page-item.active .page-link {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }
    
    .pagination .page-item.disabled .page-link {
      color: #6c757d;
      pointer-events: none;
      background-color: #fff;
      border-color: #dee2e6;
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() total: number = 0;
  @Input() maxVisiblePages: number = 5;
  
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.total);
  }

  get visiblePages(): (number | string)[] {
    if (this.totalPages <= this.maxVisiblePages) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(this.maxVisiblePages / 2);

    // Sempre mostrar primeira página
    pages.push(1);

    if (this.currentPage > halfVisible + 2) {
      pages.push('...');
    }

    // Páginas ao redor da página atual
    const start = Math.max(2, this.currentPage - halfVisible);
    const end = Math.min(this.totalPages - 1, this.currentPage + halfVisible);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (this.currentPage < this.totalPages - halfVisible - 1) {
      pages.push('...');
    }

    // Sempre mostrar última página
    if (this.totalPages > 1) {
      pages.push(this.totalPages);
    }

    return pages;
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
