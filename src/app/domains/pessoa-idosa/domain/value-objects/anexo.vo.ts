import { CampoObrigatorioErro } from "../errors/pessoa-idosa.errors";
import { CategoriaAnexo } from "./enums";

export interface AnexoProps {
    categoria: CategoriaAnexo;
    url: string;
    path: string;
    nome: string;
}

export class Anexo {
    readonly categoria: CategoriaAnexo;
    readonly url: string;
    readonly path: string;
    readonly nome: string;

    private constructor(props: AnexoProps) {
        if (!props.categoria) throw new CampoObrigatorioErro('Anexo: categoria')
        if (!props.url) throw new CampoObrigatorioErro('Anexo: url')
        if (!props.path) throw new CampoObrigatorioErro('Anexo: path')
        if (!props.nome) throw new CampoObrigatorioErro('Anexo: nome')

        this.categoria = props.categoria;
        this.url = props.url;
        this.path = props.path;
        this.nome = props.nome;
        Object.freeze(this);
    }

    public static criar(props: AnexoProps): Anexo {
        const categoriasValidas = Object.values(CategoriaAnexo).map(Number).filter(v => !isNaN(v));
        if (!categoriasValidas.includes(props.categoria)) {
            throw new Error(`Categoria de anexo inválida: ${props.categoria}`);
        }
        return new Anexo(props);
    }

    public static rehidratar(props: AnexoProps): Anexo {
        return new Anexo(props);
    }

    public toJSON() {
        return {
            categoria: this.categoria,
            url: this.url,
            path: this.path,
            nome: this.nome
        };
    }
}