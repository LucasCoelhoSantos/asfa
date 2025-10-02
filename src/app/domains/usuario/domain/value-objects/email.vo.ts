import { EmailInvalidoError } from "../errors/usuario.errors";

export class Email {
    private readonly _valor: string;

    private constructor(valor: string) {
        this._valor = valor;
        Object.freeze(this);
    }

    public static criar(valor: string): Email {
        if (!this.validar(valor)) {
        throw new EmailInvalidoError(valor);
        }
        return new Email(valor.toLowerCase());
    }

    public get valor(): string {
        return this._valor;
    }

    private static validar(email: string): boolean {
        if (!email) {
        return false;
        }
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }
}