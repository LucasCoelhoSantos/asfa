import { ValorInvalidoErro } from "../errors/pessoa-idosa.errors";

export class CPF {
  private readonly _valor: string;

  private constructor(valor: string) {
    this._valor = valor;
    Object.freeze(this);
  }

  public static criar(valor: string): CPF {
    const cpfLimpo = this.limpar(valor);
    if (!this.validar(cpfLimpo)) {
      throw new ValorInvalidoErro('CPF', valor, 'Formato ou dígito verificador inválido');
    }
    return new CPF(cpfLimpo);
  }

  public get valor(): string {
    return this._valor;
  }

  public get valorFormatado(): string {
    return this._valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private static limpar(cpf: string): string {
    return (cpf || '').replace(/\D/g, '');
  }

  private static validar(cpf: string): boolean {
    if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
      resto = 0;
    }
    if (resto !== parseInt(cpf.substring(9, 10))) {
      return false;
    }
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
      resto = 0;
    }
    return resto === parseInt(cpf.substring(10, 11));
  }
}