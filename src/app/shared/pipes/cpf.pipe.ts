import { Pipe, PipeTransform } from '@angular/core';
import { MaskUtils } from '../utils/mask.utils';

@Pipe({
  name: 'cpf',
  standalone: true
})
export class CpfPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return MaskUtils.aplicaMascaraDeCPF(value);
  }
} 