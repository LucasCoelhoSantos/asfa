import { ValorInvalidoErro } from "../errors/pessoa-idosa.errors";

export class RG {
    private readonly _valor: string;

    private constructor(valor: string) {
        this._valor = valor;
        Object.freeze(this);
    }

    public static criar(valor: string): RG {
        const rgLimpo = this.limpar(valor);
        if (!this.validar(rgLimpo)) {
            throw new ValorInvalidoErro('RG', valor, 'O RG deve conter entre 5 e 20 caracteres.');
        }
        return new RG(rgLimpo);
    }

    public get valor(): string {
        return this._valor;
    }

    private static limpar(rg: string): string {
        return (rg || '').replace(/\s+/g, '');
    }

    private static validar(rg: string): boolean {
        return !!rg && rg.length >= 5 && rg.length <= 20;
    }
}