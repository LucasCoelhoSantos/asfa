export class DominioErro extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class EmailInvalidoError extends DominioErro {
    constructor(email: string) {
        super(`O e-mail "${email}" é inválido.`);
    }
}

export class NomeInvalidoError extends DominioErro {
    constructor(message: string = 'O nome é invalido.') {
        super(message);
    }
}

export class CargoInvalidoError extends DominioErro {
    constructor(message: string = 'O cargo é obrigatório.') {
        super(message);
    }
}

export class SenhaInvalidoError extends DominioErro {
    constructor(message: string = 'A senha é obrigatória.') {
        super(message);
    }
}