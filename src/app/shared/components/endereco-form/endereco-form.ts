import { Component, Input, OnInit, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CEP_PORT, CepPort } from '../../ports/cep.port';
import { MORADIAS_OPCOES } from '../../constants/app.constants';
import { MaskDirective } from '../../directives/mask.directive';

@Component({
  selector: 'app-endereco-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaskDirective],
  templateUrl: './endereco-form.html',
})
export class EnderecoFormComponent implements OnInit {
  @Input() form!: FormGroup;

  private cepPort: CepPort = inject(CEP_PORT);

  public cepLoading = false;
  public cepError: string | null = null;

  public readonly moradiasOptions = MORADIAS_OPCOES;

  ngOnInit(): void {
    if (!this.form) {
      console.error('EnderecoFormComponent: FormGroup não foi fornecido via @Input.');
    }
  }

  buscarCep(): void {
    const cepControl = this.form.get('cep');
    if (!cepControl || cepControl.invalid) {
      this.cepError = 'Por favor, insira um CEP válido.';
      return;
    }

    const cep = cepControl.value;
    this.cepLoading = true;
    this.cepError = null;

    this.cepPort.buscar(cep).subscribe({
      next: (enderecoDto) => {
        if (enderecoDto) {
          this.form.patchValue({
            logradouro: enderecoDto.logradouro,
            bairro: enderecoDto.bairro,
            cidade: enderecoDto.cidade,
            estado: enderecoDto.estado,
          });
        } else {
          this.cepError = 'CEP não encontrado.';
        }
        this.cepLoading = false;
      },
      error: () => {
        this.cepError = 'Erro ao buscar o CEP. Tente novamente.';
        this.cepLoading = false;
      }
    });
  }

  borrarCep(): void {
    this.cepError = null;
  }
}