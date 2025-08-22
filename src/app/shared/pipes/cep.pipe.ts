import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cep',
  standalone: true
})
export class CepPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    // Remove caracteres não numéricos
    const cep = value.replace(/\D/g, '');
    
    // Aplica máscara
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
} 