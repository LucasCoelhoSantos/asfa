import { Pipe, PipeTransform } from '@angular/core';
import { MaskUtils } from '../utils/mask.utils';

@Pipe({
  name: 'telefone',
  standalone: true
})
export class TelefonePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return MaskUtils.aplicaMascaraDeTelefone(value);
  }
} 