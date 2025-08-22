export class MaskUtils {
  /**
   * Aplica máscara de CPF
   */
  static applyCpfMask(value: string): string {
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

  /**
   * Aplica máscara de RG
   */
  static applyRgMask(value: string): string {
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

  /**
   * Aplica máscara de CEP
   */
  static applyCepMask(value: string): string {
    if (!value) return '';
    
    const cep = value.replace(/\D/g, '');
    
    if (cep.length <= 5) {
      return cep;
    } else {
      return cep.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    }
  }

  /**
   * Aplica máscara de telefone
   */
  static applyPhoneMask(value: string): string {
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

  /**
   * Remove todas as máscaras de um valor
   */
  static removeMask(value: string): string {
    return value ? value.replace(/\D/g, '') : '';
  }

  /**
   * Valida se um CPF está completo
   */
  static isCpfComplete(value: string): boolean {
    const cpf = this.removeMask(value);
    return cpf.length === 11;
  }

  /**
   * Valida se um CEP está completo
   */
  static isCepComplete(value: string): boolean {
    const cep = this.removeMask(value);
    return cep.length === 8;
  }
}
