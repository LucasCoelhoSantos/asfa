import { ValorInvalidoErro } from "../errors/pessoa-idosa.errors";

export class Telefone {
    private readonly _valor: string;

    private constructor(valor: string) {
        this._valor = valor;
        Object.freeze(this);
    }

    public static criar(valor: string): Telefone {
        const telefoneLimpo = this.limpar(valor);
        if (!this.validar(telefoneLimpo)) {
            throw new ValorInvalidoErro('Telefone', valor, 'O telefone deve ter 10 ou 11 dígitos.');
        }
        return new Telefone(telefoneLimpo);
    }

    public get valor(): string {
        return this._valor;
    }

    public get valorFormatado(): string {
        if (this._valor.length === 11) {
            return this._valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return this._valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    private static limpar(telefone: string): string {
        return (telefone || '').replace(/\D/g, '');
    }

    private static validar(telefone: string): boolean {
        return !!telefone && (telefone.length === 10 || telefone.length === 11);
    }
}