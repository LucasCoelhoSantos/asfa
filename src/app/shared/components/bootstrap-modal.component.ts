import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bootstrap-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="modal fade" 
      [id]="modalId"
      tabindex="-1" 
      [attr.aria-labelledby]="modalId + 'Label'"
      aria-hidden="true"
      [class.show]="show"
      [style.display]="show ? 'block' : 'none'">
      
      <div class="modal-dialog" [ngClass]="sizeClass">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header" [ngClass]="headerClass">
            <h5 class="modal-title" [id]="modalId + 'Label'">
              <i *ngIf="icon" [class]="icon + ' me-2'"></i>
              {{ title }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Fechar"
              (click)="onCancel()">
            </button>
          </div>
          
          <!-- Body -->
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          
          <!-- Footer -->
          <div class="modal-footer" *ngIf="showFooter">
            <button 
              type="button" 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
              (click)="onCancel()">
              {{ cancelText }}
            </button>
            <button 
              type="button" 
              class="btn" 
              [ngClass]="confirmButtonClass"
              (click)="onConfirm()"
              [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Carregando...</span>
              </span>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop -->
    <div 
      class="modal-backdrop fade" 
      [class.show]="show"
      *ngIf="show">
    </div>
  `,
  styles: [`
    .modal.show {
      display: block !important;
    }
    
    .modal-backdrop.show {
      opacity: 0.5;
    }
    
    .modal-header {
      border-bottom: 1px solid rgba(0,0,0,.125);
    }
    
    .modal-footer {
      border-top: 1px solid rgba(0,0,0,.125);
    }
  `]
})
export class BootstrapModalComponent implements OnInit, OnDestroy {
  @Input() modalId: string = 'modal';
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() show: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() headerClass: string = '';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() confirmButtonClass: string = 'btn-primary';
  @Input() showFooter: boolean = true;
  @Input() loading: boolean = false;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() showChange = new EventEmitter<boolean>();

  private modalElement: any;

  ngOnInit() {
    this.modalElement = document.getElementById(this.modalId);
  }

  ngOnDestroy() {
    if (this.modalElement) {
      // Cleanup se necessário
    }
  }

  get sizeClass(): string {
    switch (this.size) {
      case 'sm': return 'modal-sm';
      case 'lg': return 'modal-lg';
      case 'xl': return 'modal-xl';
      default: return '';
    }
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
    this.show = false;
    this.showChange.emit(false);
  }

  open() {
    this.show = true;
    this.showChange.emit(true);
  }

  close() {
    this.show = false;
    this.showChange.emit(false);
  }
}
