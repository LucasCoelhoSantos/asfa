import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'telefone',
  standalone: true
})
export class TelefonePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    // Remove caracteres não numéricos
    const telefone = value.replace(/\D/g, '');
    
    // Aplica máscara baseada no tamanho
    if (telefone.length === 11) {
      // Celular com DDD
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length === 10) {
      // Telefone fixo com DDD
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length === 8) {
      // Telefone sem DDD
      return telefone.replace(/(\d{4})(\d{4})/, '$1-$2');
    } else if (telefone.length === 9) {
      // Celular sem DDD
      return telefone.replace(/(\d{5})(\d{4})/, '$1-$2');
    }
    
    return telefone;
  }
} 