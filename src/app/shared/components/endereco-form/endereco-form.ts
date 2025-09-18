import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MaskDirective } from '../../directives/mask.directive';
import { MORADIAS_OPCOES } from '../../constants/app.constants';
import { EnderecoService } from './endereco.service';

@Component({
  selector: 'app-endereco-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaskDirective],
  templateUrl: './endereco-form.html'
})
export class EnderecoFormComponent implements OnInit {
  @Input() form: AbstractControl | null = null;
  @Output() enderecoChange = new EventEmitter<any>();

  formGroup!: FormGroup;
  moradiasOptions = MORADIAS_OPCOES;

  cepLoading = false;
  cepError: string | null = null;

  constructor(private enderecoService: EnderecoService) {}

  ngOnInit() {
    if (this.form instanceof FormGroup) {
      this.formGroup = this.form;
    } else {
      this.formGroup = new FormGroup({
        cep: new FormControl(''),
        moradia: new FormControl(''),
        logradouro: new FormControl(''),
        numero: new FormControl(''),
        bairro: new FormControl(''),
        cidade: new FormControl(''),
        estado: new FormControl(''),
      });
    }
  }

  borrarCep() {
    const cep = this.formGroup.get('cep')?.value?.replace(/\D/g, '') || '';
    if (cep.length === 8) {
      this.buscarCep();
    }
  }

  async buscarCep() {
    if (!this.formGroup) return;
    
    const cepControl = this.formGroup.get('cep');
    if (!cepControl) return;
    
    const cep = this.enderecoService.limparCep(cepControl.value || '');
    
    this.cepLoading = true;
    this.cepError = null;

    try {
      const dadosEndereco = await this.enderecoService.buscarCep(cep).toPromise();
      
      if (dadosEndereco) {
        this.formGroup.patchValue({
          logradouro: dadosEndereco.logradouro,
          bairro: dadosEndereco.bairro,
          cidade: dadosEndereco.cidade,
          estado: dadosEndereco.estado
        });
        this.enderecoChange.emit(this.formGroup.value);
        this.cepError = null;
      }
    } catch (error: any) {
      this.cepError = error.message || 'Erro ao buscar CEP. Tente novamente.';
    } finally {
      this.cepLoading = false;
    }
  }
}