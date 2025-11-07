import { CampoObrigatorioErro } from "../errors/pessoa-idosa.errors";
import { CategoriaAnexo } from "./enums";

export interface AnexoProps {
  categoria: CategoriaAnexo;
  url: string;
  path: string;
}

export class Anexo {
  readonly categoria: CategoriaAnexo;
  readonly url: string;
  readonly path: string;

  private constructor(props: AnexoProps) {
    if (!props.categoria) throw new CampoObrigatorioErro('Anexo: categoria')
    if (!props.url) throw new CampoObrigatorioErro('Anexo: url')
    if (!props.path) throw new CampoObrigatorioErro('Anexo: path')

    this.categoria = props.categoria;
    this.url = props.url;
    this.path = props.path;
    Object.freeze(this);
  }

  public static criar(props: AnexoProps): Anexo {
    const categoriasValidas = Object.values(CategoriaAnexo).map(Number).filter(v => !isNaN(v));
    const categoriaNormalizada = typeof (props as any).categoria === 'string'
    ? Number((props as any).categoria)
    : (props as any).categoria;
    
    if (!categoriasValidas.includes(categoriaNormalizada)) {
      throw new Error(`Categoria de anexo inválida: ${props.categoria}`);
    }
    
    return new Anexo({
      ...props,
      categoria: categoriaNormalizada as CategoriaAnexo
    });
  }

  public static rehidratar(props: AnexoProps): Anexo {
    const categoriaNormalizada = typeof (props as any).categoria === 'string'
      ? Number((props as any).categoria)
      : (props as any).categoria;
    return new Anexo({
      ...props,
      categoria: categoriaNormalizada as CategoriaAnexo
    });
  }

  public toJSON() {
    return {
      categoria: this.categoria,
      url: this.url,
      path: this.path
    };
  }
}