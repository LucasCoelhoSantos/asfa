import { NomeInvalidoError } from "../errors/usuario.errors";

export class Nome {
  private readonly _valor: string;

  private constructor(valor: string) {
    this._valor = valor;
    Object.freeze(this);
  }

  public static criar(valor: string): Nome {
    if (!this.validar(valor)) {
      throw new NomeInvalidoError('O nome não pode estar vazio e deve ter entre 3 e 100 caracteres.');
    }
    return new Nome(valor);
  }

  public get valor(): string {
    return this._valor;
  }

  private static validar(nome: string): boolean {
    return !!nome && nome.trim().length >= 3 && nome.trim().length <= 100;
  }
}