import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';

export interface FormFieldOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-bootstrap-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-3">
      <label [for]="fieldId" class="form-label">
        {{ label }}
        <span class="text-danger" *ngIf="required">*</span>
      </label>
      
      <!-- Input Text/Email/Password/Number -->
      <input 
        *ngIf="type === 'text' || type === 'email' || type === 'password' || type === 'number'"
        [id]="fieldId"
        [type]="type"
        class="form-control"
        [class.form-control-lg]="size === 'lg'"
        [class.form-control-sm]="size === 'sm'"
        [class.is-invalid]="control.invalid && control.touched"
        [formControlName]="controlName"
        [placeholder]="placeholder"
        [attr.maxlength]="maxLength"
        [attr.inputmode]="inputMode"
        [disabled]="disabled" />
      
      <!-- Input Date -->
      <input 
        *ngIf="type === 'date'"
        [id]="fieldId"
        type="date"
        class="form-control"
        [class.form-control-lg]="size === 'lg'"
        [class.form-control-sm]="size === 'sm'"
        [class.is-invalid]="control.invalid && control.touched"
        [formControlName]="controlName"
        [disabled]="disabled" />
      
      <!-- Select -->
      <select 
        *ngIf="type === 'select'"
        [id]="fieldId"
        class="form-select"
        [class.form-select-lg]="size === 'lg'"
        [class.form-select-sm]="size === 'sm'"
        [class.is-invalid]="control.invalid && control.touched"
        [formControlName]="controlName"
        [disabled]="disabled">
        <option value="">{{ placeholder || 'Selecione uma opção' }}</option>
        <option *ngFor="let option of options" [value]="option.value || option">
          {{ option.label || option }}
        </option>
      </select>
      
      <!-- Textarea -->
      <textarea 
        *ngIf="type === 'textarea'"
        [id]="fieldId"
        class="form-control"
        [class.form-control-lg]="size === 'lg'"
        [class.form-control-sm]="size === 'sm'"
        [class.is-invalid]="control.invalid && control.touched"
        [formControlName]="controlName"
        [placeholder]="placeholder"
        [rows]="rows"
        [disabled]="disabled"></textarea>
      
      <!-- Checkbox -->
      <div *ngIf="type === 'checkbox'" class="form-check">
        <input 
          [id]="fieldId"
          type="checkbox"
          class="form-check-input"
          [class.is-invalid]="control.invalid && control.touched"
          [formControlName]="controlName"
          [disabled]="disabled" />
        <label [for]="fieldId" class="form-check-label">
          {{ label }}
        </label>
      </div>
      
      <!-- Radio Group -->
      <div *ngIf="type === 'radio'" class="d-flex flex-column gap-2">
        <div *ngFor="let option of options" class="form-check">
          <input 
            [id]="fieldId + '_' + option.value"
            type="radio"
            class="form-check-input"
            [class.is-invalid]="control.invalid && control.touched"
            [formControlName]="controlName"
            [value]="option.value"
            [disabled]="disabled" />
          <label [for]="fieldId + '_' + option.value" class="form-check-label">
            {{ option.label }}
          </label>
        </div>
      </div>
      
      <!-- Error Messages -->
      <div class="invalid-feedback" *ngIf="control.invalid && control.touched">
        <ng-container *ngIf="control.errors?.['required']; else customError">
          Campo obrigatório.
        </ng-container>
        <ng-template #customError>
          <ng-container *ngIf="errorMessage">
            {{ errorMessage }}
          </ng-container>
        </ng-template>
      </div>
      
      <!-- Help Text -->
      <div *ngIf="helpText" class="form-text">
        {{ helpText }}
      </div>
    </div>
  `,
  styles: [`
    .form-label {
      font-weight: 500;
      color: #495057;
      margin-bottom: 0.5rem;
    }
    
    .form-control:focus,
    .form-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
    
    .form-check-input:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
  `]
})
export class BootstrapFormFieldComponent {
  @Input() fieldId: string = '';
  @Input() label: string = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' = 'text';
  @Input() control!: AbstractControl;
  @Input() controlName: string = '';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() maxLength?: number;
  @Input() inputMode?: string;
  @Input() disabled: boolean = false;
  @Input() options: FormFieldOption[] = [];
  @Input() rows: number = 3;
  @Input() errorMessage: string = '';
  @Input() helpText: string = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
