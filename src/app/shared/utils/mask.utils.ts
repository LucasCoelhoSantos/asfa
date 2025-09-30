export class MaskUtils {
  static aplicaMascaraDeCPF(value: string): string {
    if (!value) return '';
    
    const cpf = value.replace(/\D/g, '');
    
    if (cpf.length <= 3) {
      return cpf;
    } else if (cpf.length <= 6) {
      return cpf.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    } else if (cpf.length <= 9) {
      return cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }
  }

  static aplicaMascaraDeRG(value: string): string {
    if (!value) return '';
    
    const rg = value.replace(/\D/g, '');
    
    if (rg.length <= 2) {
      return rg;
    } else if (rg.length <= 5) {
      return rg.replace(/(\d{2})(\d{0,3})/, '$1.$2');
    } else if (rg.length <= 8) {
      return rg.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else {
      return rg.replace(/(\d{2})(\d{3})(\d{3})(\w{0,1})/, '$1.$2.$3-$4');
    }
  }

  static aplicaMascaraDeCEP(value: string): string {
    if (!value) return '';
    
    const cep = value.replace(/\D/g, '');
    
    if (cep.length <= 5) {
      return cep;
    } else {
      return cep.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    }
  }

  static aplicaMascaraDeTelefone(value: string): string {
    if (!value) return '';
    
    const phone = value.replace(/\D/g, '');
    
    if (phone.length <= 2) {
      return phone;
    } else if (phone.length <= 6) {
      return phone.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    } else if (phone.length <= 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return phone.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  }

  static removeMascara(value: string): string {
    return value ? value.replace(/\D/g, '') : '';
  }

  static isCpfComplete(value: string): boolean {
    const cpf = this.removeMascara(value);
    return cpf.length === 11;
  }

  static isCepComplete(value: string): boolean {
    const cep = this.removeMascara(value);
    return cep.length === 8;
  }
}
