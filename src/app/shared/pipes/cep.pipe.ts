import { Pipe, PipeTransform } from '@angular/core';
import { MaskUtils } from '../utils/mask.utils';

@Pipe({
  name: 'cep',
  standalone: true
})
export class CepPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return MaskUtils.aplicaMascaraDeCEP(value);
  }
} 