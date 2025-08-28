import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FilterField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'checkbox';
  placeholder?: string;
  options?: { value: any; label: string }[];
  width?: string;
}

@Component({
  selector: 'app-filter-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-light">
        <h5 class="card-title mb-0">
          <i class="bi bi-funnel me-2"></i>
          {{ title }}
        </h5>
      </div>
      <div class="card-body">
        <!-- Filtros -->
        <div class="row g-3 mb-4">
          <div class="col-12">
            <h6 class="text-primary mb-3">{{ sectionTitle }}</h6>
          </div>
          
          <div 
            *ngFor="let field of fields" 
            [class]="field.width || 'col-md-3'">
            
            <!-- Campo de texto -->
            <label *ngIf="field.type === 'text'" class="form-label">{{ field.label }}</label>
            <input 
              *ngIf="field.type === 'text'"
              type="text" 
              class="form-control" 
              [placeholder]="field.placeholder || field.label"
              (input)="onFilterChange(field.id, $event)" />
            
            <!-- Campo de data -->
            <label *ngIf="field.type === 'date'" class="form-label">{{ field.label }}</label>
            <input 
              *ngIf="field.type === 'date'"
              type="date" 
              class="form-control" 
              (input)="onFilterChange(field.id, $event)" />
            
            <!-- Campo select -->
            <label *ngIf="field.type === 'select'" class="form-label">{{ field.label }}</label>
            <select 
              *ngIf="field.type === 'select'"
              class="form-select" 
              (change)="onFilterChange(field.id, $event)">
              <option value="">Todos</option>
              <option 
                *ngFor="let option of field.options" 
                [value]="option.value">
                {{ option.label }}
              </option>
            </select>
            
            <!-- Campo checkbox -->
            <div *ngIf="field.type === 'checkbox'" class="form-check">
              <input 
                class="form-check-input" 
                type="checkbox" 
                [id]="field.id"
                (change)="onFilterChange(field.id, $event)" />
              <label class="form-check-label" [for]="field.id">
                {{ field.label }}
              </label>
            </div>
          </div>
        </div>
        
        <!-- Controles -->
        <div class="row g-3">
          <div class="col-12">
            <h6 class="text-primary mb-3">Controles</h6>
          </div>
          
          <div class="col-md-2">
            <label class="form-label">Status</label>
            <select class="form-select" (change)="onFilterChange('status', $event)">
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          
          <div class="col-md-2">
            <label class="form-label">Itens por Página</label>
            <select class="form-select" (change)="onPageSizeChange($event)">
              <option *ngFor="let size of pageSizeOptions" [value]="size">
                {{ size === -1 ? 'Todos' : size }}
              </option>
            </select>
          </div>
          
          <div class="col-md-8 d-flex align-items-end gap-2">
            <button (click)="onSearch()" class="btn btn-primary">
              <i class="bi bi-search me-2"></i>
              Buscar
            </button>
            <button (click)="onClearFilters()" class="btn btn-outline-secondary">
              <i class="bi bi-trash me-2"></i>
              Limpar Filtros
            </button>
            <button 
              *ngIf="showExportButton"
              (click)="onExport()" 
              class="btn btn-success">
              <i class="bi bi-file-pdf me-2"></i>
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-header {
      border-bottom: 1px solid rgba(0,0,0,.125);
    }
    
    .form-label {
      font-weight: 500;
      color: #495057;
      margin-bottom: 0.5rem;
    }
  `]
})
export class FilterSectionComponent {
  @Input() title: string = 'Filtros de Pesquisa';
  @Input() sectionTitle: string = 'Informações Básicas';
  @Input() fields: FilterField[] = [];
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100, -1];
  @Input() showExportButton: boolean = true;
  
  @Output() filterChange = new EventEmitter<{id: string, value: any}>();
  @Output() search = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() pageSizeChange = new EventEmitter<number>();

  onFilterChange(id: string, event: any) {
    const value = event.target?.value ?? event.target?.checked ?? event;
    this.filterChange.emit({ id, value });
  }

  onSearch() {
    this.search.emit();
  }

  onClearFilters() {
    this.clearFilters.emit();
  }

  onExport() {
    this.export.emit();
  }

  onPageSizeChange(event: any) {
    const value = +event.target.value;
    this.pageSizeChange.emit(value);
  }
}
