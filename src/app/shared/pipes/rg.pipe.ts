import { Pipe, PipeTransform } from '@angular/core';
import { MaskUtils } from '../utils/mask.utils';

@Pipe({
  name: 'rg',
  standalone: true
})
export class RgPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return MaskUtils.aplicaMascaraDeRG(value);
  }
}
