import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value || '').replace(/\D/g, '');
  if (!value || value.length !== 11) return { cpf: true };
  
  let sum = 0;
  let rest;
  
  if (value === "00000000000") return { cpf: true };
  
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(value.substring(i - 1, i)) * (11 - i);
  }
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  if (rest !== parseInt(value.substring(9, 10))) return { cpf: true };
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(value.substring(i - 1, i)) * (12 - i);
  }
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  if (rest !== parseInt(value.substring(10, 11))) return { cpf: true };
  
  return null;
}

export function rgValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value || '').replace(/\D/g, '');
  if (!value || value.length < 5) return { rg: true };
  return null;
}

export function cepValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value || '').replace(/\D/g, '');
  if (!value || value.length !== 8) return { cep: true };
  return null;
}

export function telefoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value || '').replace(/\D/g, '');
  if (!value || (value.length !== 10 && value.length !== 11)) return { telefone: true };
  return null;
}

export function dataNascimentoValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return { dataNascimento: true };
  
  const data = new Date(value);
  const hoje = new Date();
  
  if (data > hoje) return { dataNascimento: true };
  return null;
}
