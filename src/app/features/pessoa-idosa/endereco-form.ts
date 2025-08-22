import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MaskDirective } from '../../shared/directives/mask.directive';
import { MORADIAS_OPTIONS } from '../../shared/constants/app.constants';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

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
            />
            <button 
              type="button" 
              class="btn-buscar" 
              (click)="buscarCep()"
              [disabled]="cepLoading || !formGroup.get('cep')?.value"
            >
              <span class="icon" *ngIf="!cepLoading">🔍</span>
              <span class="loading-spinner" *ngIf="cepLoading"></span>
              {{ cepLoading ? 'Buscando...' : 'Buscar' }}
            </button>
          </div>
          <div class="error" *ngIf="cepError">
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
  @Output() valueChanges = new EventEmitter<any>();

  cepLoading = false;
  cepError: string | null = null;
  moradiasOptions = MORADIAS_OPTIONS;

  constructor(private http: HttpClient) {}

  get formGroup(): FormGroup<any> | null {
    return this.form instanceof FormGroup ? this.form : null;
  }

  ngOnInit() {
    if (this.form) {
      this.form.valueChanges.subscribe(val => this.valueChanges.emit(val));
      
      // Listener para CEP completo
      const cepControl = this.form.get('cep');
      if (cepControl) {
        cepControl.valueChanges.subscribe(value => {
          if (value && value.replace(/\D/g, '').length === 8) {
            this.buscarCep();
          }
        });
      }
    }
  }



  async buscarCep() {
    if (!this.formGroup) return;
    
    const cepControl = this.formGroup.get('cep');
    if (!cepControl) return;
    
    const cep = cepControl.value?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) {
      this.cepError = 'CEP deve ter 8 dígitos';
      return;
    }

    this.cepLoading = true;
    this.cepError = null;

    try {
      const response = await this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${cep}/json/`).toPromise();
      
      if (response && !response.erro) {
        // Preenche os campos automaticamente
        this.formGroup.patchValue({
          logradouro: response.logradouro || '',
          bairro: response.bairro || '',
          cidade: response.localidade || '',
          estado: response.uf || ''
        });
        
        // Limpa o erro se existia
        this.cepError = null;
      } else {
        this.cepError = 'CEP não encontrado';
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      this.cepError = 'Erro ao buscar CEP. Tente novamente.';
    } finally {
      this.cepLoading = false;
    }
  }
}