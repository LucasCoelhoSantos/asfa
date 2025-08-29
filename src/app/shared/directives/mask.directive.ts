import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { MaskUtils } from '../utils/mask.utils';

@Directive({
  selector: '[appMask]',
  standalone: true
})
export class MaskDirective {
  @Input('appMask') maskType: 'cpf' | 'rg' | 'cep' | 'phone' = 'cpf';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    switch (this.maskType) {
      case 'cpf':
        value = value.substring(0, 11);
        value = MaskUtils.applyCpfMask(value);
        break;
      case 'rg':
        value = value.substring(0, 9);
        value = MaskUtils.applyRgMask(value);
        break;
      case 'cep':
        value = value.substring(0, 8);
        value = MaskUtils.applyCepMask(value);
        break;
      case 'phone':
        value = value.substring(0, 11);
        value = MaskUtils.applyPhoneMask(value);
        break;
    }
    
    input.value = value;
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text/plain') || '';
    const input = event.target as HTMLInputElement;
    let value = pastedText.replace(/\D/g, '');
    
    switch (this.maskType) {
      case 'cpf':
        value = value.substring(0, 11);
        value = MaskUtils.applyCpfMask(value);
        break;
      case 'rg':
        value = value.substring(0, 9);
        value = MaskUtils.applyRgMask(value);
        break;
      case 'cep':
        value = value.substring(0, 8);
        value = MaskUtils.applyCepMask(value);
        break;
      case 'phone':
        value = value.substring(0, 11);
        value = MaskUtils.applyPhoneMask(value);
        break;
    }
    
    input.value = value;
  }
}
