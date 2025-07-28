import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-endereco-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="formGroup" [formGroup]="formGroup">
      <div class="endereco-fields">
        <label>CEP
          <input formControlName="cep" maxlength="9" />
          <button type="button" (click)="buscarCep()">Buscar</button>
        </label>
        <label>Logradouro
          <input formControlName="logradouro" />
        </label>
        <label>Número
          <input formControlName="numero" />
        </label>
        <label>Bairro
          <input formControlName="bairro" />
        </label>
        <label>Cidade
          <input formControlName="cidade" />
        </label>
        <label>Estado
          <input formControlName="estado" maxlength="2" />
        </label>
        <label>Moradia
          <select formControlName="moradia">
            <option value="">Selecione</option>
            <option value="própria">Própria</option>
            <option value="alugada">Alugada</option>
            <option value="cedida">Cedida</option>
            <option value="institucionalizada">Institucionalizada</option>
            <option value="outro">Outro</option>
          </select>
        </label>
      </div>
    </div>
  `,
  styleUrls: ['./endereco-form.component.scss']
})
export class EnderecoFormComponent implements OnInit {
  @Input() form: AbstractControl | null = null;
  @Output() valueChanges = new EventEmitter<any>();

  get formGroup(): FormGroup<any> | null {
    return this.form instanceof FormGroup ? this.form : null;
  }

  ngOnInit() {
    if (this.form) {
      this.form.valueChanges.subscribe(val => this.valueChanges.emit(val));
    }
  }

  buscarCep() {
    // Implementar integração ViaCEP aqui ou emitir evento para o pai
  }
}