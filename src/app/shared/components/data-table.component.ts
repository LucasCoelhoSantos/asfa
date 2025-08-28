import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'badge' | 'actions';
  format?: string;
  badgeClass?: string;
  width?: string;
}

export interface TableAction {
  icon: string;
  label: string;
  class: string;
  action: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th *ngFor="let column of columns" [style.width]="column.width">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of data; let i = index">
            <td *ngFor="let column of columns">
              <!-- Text -->
              <ng-container *ngIf="column.type === 'text' || !column.type">
                {{ getValue(item, column.key) }}
              </ng-container>
              
              <!-- Date -->
              <ng-container *ngIf="column.type === 'date'">
                {{ getValue(item, column.key) | date:column.format || 'dd/MM/yyyy' }}
              </ng-container>
              
                             <!-- Badge -->
               <ng-container *ngIf="column.type === 'badge'">
                 <span class="badge" [ngClass]="getBadgeClass(item, column)">
                   {{ getBadgeLabel(item, column) }}
                 </span>
               </ng-container>
              
              <!-- Actions -->
              <ng-container *ngIf="column.type === 'actions'">
                <div class="btn-group btn-group-sm" role="group">
                  <button 
                    *ngFor="let action of actions" 
                    type="button" 
                    class="btn" 
                    [ngClass]="action.class"
                    (click)="onAction(action.action, item, i)"
                    [title]="action.label">
                    <i [class]="action.icon + ' me-1'"></i>
                    {{ action.label }}
                  </button>
                </div>
              </ng-container>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Empty State -->
      <div *ngIf="data.length === 0" class="text-center py-4">
        <div class="text-muted mb-3">
          <i class="bi bi-inbox" style="font-size: 3rem;"></i>
        </div>
        <h6 class="text-muted">{{ emptyMessage || 'Nenhum registro encontrado' }}</h6>
        <small class="text-muted">{{ emptySubMessage || 'Não há dados para exibir' }}</small>
      </div>
    </div>
  `,
  styles: [`
    .table th {
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }
    
    .table td {
      vertical-align: middle;
    }
    
    .btn-group .btn {
      border-radius: 0.375rem;
    }
    
    .btn-group .btn:first-child {
      border-top-left-radius: 0.375rem;
      border-bottom-left-radius: 0.375rem;
    }
    
    .btn-group .btn:last-child {
      border-top-right-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }
  `]
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() emptyMessage: string = 'Nenhum registro encontrado';
  @Input() emptySubMessage: string = 'Não há dados para exibir';
  
  @Output() actionClick = new EventEmitter<{action: string, item: any, index: number}>();

  getValue(item: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  }

  getBadgeClass(item: any, column: TableColumn): string {
    if (column.badgeClass) {
      return column.badgeClass;
    }
    
    const value = this.getValue(item, column.key);
    if (typeof value === 'boolean') {
      return value ? 'bg-success' : 'bg-secondary';
    }
    
    return 'bg-primary';
  }

  getBadgeLabel(item: any, column: TableColumn): string {
    const value = this.getValue(item, column.key);
    
    // Tratamento especial para campos booleanos
    if (typeof value === 'boolean') {
      if (column.key === 'ativo') {
        return value ? 'Ativo' : 'Inativo';
      }
      return value ? 'Sim' : 'Não';
    }
    
    return value;
  }

  onAction(action: string, item: any, index: number) {
    this.actionClick.emit({ action, item, index });
  }
}
