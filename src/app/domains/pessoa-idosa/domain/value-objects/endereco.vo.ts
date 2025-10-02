import { CampoObrigatorioErro } from "../errors/pessoa-idosa.errors";

export interface EnderecoProps {
    cep: string;
    moradia: string;
    logradouro: string;
    numero?: number;
    bairro: string;
    cidade: string;
    estado: string;
}

export class Endereco {
    readonly cep: string;
    readonly moradia: string;
    readonly logradouro: string;
    readonly numero?: number;
    readonly bairro: string;
    readonly cidade: string;
    readonly estado: string;

    private constructor(props: EnderecoProps) {
        this.cep = props.cep;
        this.moradia = props.moradia;
        this.logradouro = props.logradouro;
        this.numero = props.numero;
        this.bairro = props.bairro;
        this.cidade = props.cidade;
        this.estado = props.estado;
        Object.freeze(this);
    }

    public static criar(props: EnderecoProps): Endereco {
        const camposObrigatorios: (keyof EnderecoProps)[] = [
            'cep', 'moradia', 'logradouro', 'numero', 'bairro', 'cidade', 'estado'
        ]
        for (const campo of camposObrigatorios) {
            if (!props[campo]) {
                throw new CampoObrigatorioErro(`Endereço: ${campo}`)
            }
        }
        return new Endereco(props);
    }

    public static rehidratar(props: EnderecoProps): Endereco {
        return new Endereco(props);
    }

    public toJSON() {
        return {
            cep: this.cep,
            moradia: this.moradia,
            logradouro: this.logradouro,
            numero: this.numero,
            bairro: this.bairro,
            cidade: this.cidade,
            estado: this.estado
        };
    }
}