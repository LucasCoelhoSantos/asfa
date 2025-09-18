import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html'
})
export class ModalComponent {
  @Input() mostrar: boolean = false;
  @Input() titulo: string = '';
  @Input() mensagem: string = '';
  @Input() confirmarTexto: string = 'Confirmar';
  @Input() cancelarTexto: string = 'Cancelar';

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  aoConfirmar() {
    this.confirmar.emit();
  }

  aoCancelar() {
    this.cancelar.emit();
  }
}