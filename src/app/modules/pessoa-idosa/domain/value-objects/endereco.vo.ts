export class Endereco {
    readonly cep: string;
    readonly moradia: string;
    readonly logradouro: string;
    readonly numero: string;
    readonly bairro: string;
    readonly cidade: string;
    readonly estado: string;

    private constructor(props: {
        cep: string;
        moradia: string;
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
    }) {
        this.cep = props.cep;
        this.moradia = props.moradia;
        this.logradouro = props.logradouro;
        this.numero = props.numero;
        this.bairro = props.bairro;
        this.cidade = props.cidade;
        this.estado = props.estado;
        Endereco.validar(this);
        Object.freeze(this);
    }

    static criar(props: {
        cep: string;
        moradia: string;
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
    }): Endereco {
        return new Endereco({
            cep: Endereco.normalizarCep(props.cep),
            moradia: props.moradia?.trim(),
            logradouro: props.logradouro?.trim(),
            numero: props.numero?.trim(),
            bairro: props.bairro?.trim(),
            cidade: props.cidade?.trim(),
            estado: props.estado?.trim().toUpperCase(),
        });
    }

    equals(outro: Endereco): boolean {
        return this.cep === outro.cep
            && this.logradouro === outro.logradouro
            && this.numero === outro.numero
            && this.bairro === outro.bairro
            && this.cidade === outro.cidade
            && this.estado === outro.estado;
    }

    private static validar(endereco: Endereco): void {
        if (!/^[0-9]{5}-?[0-9]{3}$/.test(endereco.cep)) {
            throw new Error('CEP inválido');
        }
        const camposObrigatorios = [
            endereco.moradia,
            endereco.logradouro,
            endereco.numero,
            endereco.bairro,
            endereco.cidade,
            endereco.estado,
        ];
        if (camposObrigatorios.some(c => !c || !c.trim())) {
            throw new Error('Endereço inválido: campos obrigatórios ausentes');
        }
        if (endereco.estado.length !== 2) {
            throw new Error('Estado deve ter 2 letras');
        }
    }

    private static normalizarCep(cep: string): string {
        const digits = (cep || '').replace(/\D/g, '');
        if (digits.length !== 8) return cep;
        return digits.substring(0,5) + '-' + digits.substring(5);
    }
}

export interface EnderecoDTO {
    cep: string;
    logradouro: string;
    bairro: string;
    cidade: string;
    estado: string;
}

