import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Dependente } from '../../models/pessoa-idosa.model';
import { FormCardComponent } from '../../shared/components/form-card.component';
import { BootstrapFormFieldComponent } from '../../shared/components/bootstrap-form-field.component';
import { BootstrapButtonComponent } from '../../shared/components/bootstrap-button.component';

@Component({
  selector: 'app-dependente-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormCardComponent, 
    BootstrapFormFieldComponent, 
    BootstrapButtonComponent
  ],
  templateUrl: './dependente-form.html',
  styleUrls: ['./dependente-form.scss']
})
export class DependenteFormComponent implements OnInit {
  @Input() dependente?: Dependente;
  @Output() save = new EventEmitter<Dependente>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      parentesco: ['', Validators.required],
      ceinf: [''],
      ceinfBairro: [''],
      programaSaudePastoralCrianca: [''],
      programaSaudePastoralCriancaLocal: [''],
      ativo: [true],
      composicaoFamiliar: this.fb.group({}) // pode ser detalhado depois
    });
  }

  ngOnInit() {
    if (this.dependente) {
      this.form.patchValue(this.dependente);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.save.emit(this.form.value);
  }

  onCancel() {
    this.cancel.emit();
  }
}