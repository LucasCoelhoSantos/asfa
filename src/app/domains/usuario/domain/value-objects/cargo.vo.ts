import { CargoInvalidoError } from "../errors/usuario.errors";

export class Cargo {
  private readonly _valor: string;

  private constructor(valor: string) {
    this._valor = valor;
    Object.freeze(this);
  }

  public static criar(valor: string): Cargo {
    if (!this.validar(valor)) {
      throw new CargoInvalidoError();
    }
    return new Cargo(valor);
  }

  public get valor(): string {
    return this._valor;
  }

  private static validar(cargo: string): boolean {
    return !!cargo && cargo.trim().length >= 3 && cargo.trim().length <= 100;
  }
}