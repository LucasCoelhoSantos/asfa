import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MaskDirective } from '../../directives/mask.directive';
import { MORADIAS_OPTIONS } from '../../constants/app.constants';
import { EnderecoService, EnderecoData } from './endereco.service';

/**
 * Componente reutilizável para formulário de endereço
 * Inclui busca automática de CEP via ViaCEP
 * Usado em: Pessoa Idosa Form, potencialmente outros formulários
 */
@Component({
  selector: 'app-endereco-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaskDirective],
  template: `
    <div *ngIf="formGroup" [formGroup]="formGroup" class="endereco-form">
      <div class="endereco-grid">
        <div class="form-group cep-group">
          <label for="cep">CEP *</label>
          <div class="cep-input-group">
            <input 
              id="cep" 
              formControlName="cep" 
              maxlength="9" 
              placeholder="00000-000"
              appMask="cep"
              [class.loading]="cepLoading"
              (blur)="onCepBlur()"
            />
            <button 
              type="button" 
              class="btn-buscar" 
              (click)="buscarCep()"
              [disabled]="cepLoading || !formGroup.get('cep')?.value"
            >
              <i class="bi bi-search" *ngIf="!cepLoading"></i>
              <span class="loading-spinner" *ngIf="cepLoading"></span>
              {{ cepLoading ? 'Buscando...' : 'Buscar' }}
            </button>
          </div>
          <div class="error" *ngIf="cepError">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ cepError }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="moradia">Tipo de Moradia *</label>
          <select id="moradia" formControlName="moradia">
            <option value="">Selecione o tipo</option>
            <option *ngFor="let moradia of moradiasOptions" [value]="moradia">{{ moradia }}</option>
          </select>
        </div>
        
        <div class="form-group logradouro-group">
          <label for="logradouro">Logradouro *</label>
          <input id="logradouro" formControlName="logradouro" placeholder="Rua, Avenida, etc." />
        </div>
        
        <div class="form-group">
          <label for="numero">Número *</label>
          <input id="numero" formControlName="numero" placeholder="123" />
        </div>
        
        <div class="form-group">
          <label for="bairro">Bairro *</label>
          <input id="bairro" formControlName="bairro" placeholder="Nome do bairro" />
        </div>
        
        <div class="form-group">
          <label for="cidade">Cidade *</label>
          <input id="cidade" formControlName="cidade" placeholder="Nome da cidade" />
        </div>
        
        <div class="form-group">
          <label for="estado">Estado *</label>
          <input id="estado" formControlName="estado" maxlength="2" placeholder="UF" />
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./endereco-form.scss']
})
export class EnderecoFormComponent implements OnInit {
  @Input() form: AbstractControl | null = null;
  @Output() enderecoChange = new EventEmitter<any>();

  formGroup!: FormGroup;
  moradiasOptions = MORADIAS_OPTIONS;

  cepLoading = false;
  cepError: string | null = null;
  private lastCepConsulted: string | null = null;

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

  onCepBlur() {
    const cep = this.formGroup.get('cep')?.value?.replace(/\D/g, '') || '';
    if (cep.length === 8 && cep !== this.lastCepConsulted) {
      this.buscarCep();
    }
  }

  async buscarCep() {
    if (!this.formGroup) return;
    
    const cepControl = this.formGroup.get('cep');
    if (!cepControl) return;
    
    const cep = this.enderecoService.limparCep(cepControl.value || '');
    if (!this.enderecoService.validarCep(cep)) {
      this.cepError = 'CEP deve ter 8 dígitos';
      return;
    }

    if (this.lastCepConsulted === cep) {
      return;
    }

    this.cepLoading = true;
    this.cepError = null;

    try {
      const enderecoData = await this.enderecoService.buscarCep(cep).toPromise();
      this.lastCepConsulted = cep;
      
      if (enderecoData) {
        this.formGroup.patchValue({
          logradouro: enderecoData.logradouro,
          bairro: enderecoData.bairro,
          cidade: enderecoData.cidade,
          estado: enderecoData.estado
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