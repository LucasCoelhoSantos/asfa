export class Anexo {
    readonly categoria: number;
    readonly url: string;
    readonly path: string;
    readonly nomeArquivo?: string;

    private constructor(props: { categoria: number; url: string; path: string; nomeArquivo?: string }) {
        this.categoria = props.categoria;
        this.url = props.url;
        this.path = props.path;
        this.nomeArquivo = props.nomeArquivo;
        Anexo.validar(this);
        Object.freeze(this);
    }

    static criar(props: { categoria: number; url: string; path: string; nomeArquivo?: string }): Anexo {
        return new Anexo({
            categoria: props.categoria,
            url: props.url?.trim(),
            path: props.path?.trim(),
            nomeArquivo: props.nomeArquivo?.trim(),
        });
    }

    private static validar(anexo: Anexo): void {
        if (typeof anexo.categoria !== 'number' || anexo.categoria < 0) {
            throw new Error('Categoria do anexo inválida');
        }
        try {
            new URL(anexo.url);
        } catch {
            throw new Error('URL do anexo inválida');
        }
        if (!anexo.path) {
            throw new Error('Path do anexo inválido');
        }
    }
}

