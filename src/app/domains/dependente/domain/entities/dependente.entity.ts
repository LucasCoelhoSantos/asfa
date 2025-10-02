import { Nome } from "../../../usuario/domain/value-objects/nome.vo";
import { CampoObrigatorioErro } from "../../../pessoa-idosa/domain/errors/pessoa-idosa.errors";
import { ComposicaoFamiliar } from '../../../pessoa-idosa/domain/value-objects/composicao-familiar.vo';

export interface DependenteProps {
    id?: string;
    ativo?: boolean;
    nome: string;
    dataNascimento: Date;
    parentesco: string;
    ceinf: string;
    ceinfBairro: string;
    programaSaudePastoralCrianca: string;
    programaSaudePastoralCriancaLocal: string;
    composicaoFamiliar: ComposicaoFamiliar;
}

export class Dependente {
    private _id?: string;
    private _ativo: boolean;
    private _nome: Nome;
    private _dataNascimento: Date;
    private _parentesco: string;
    private _ceinf: string;
    private _ceinfBairro: string;
    private _programaSaudePastoralCrianca: string;
    private _programaSaudePastoralCriancaLocal: string;
    private _composicaoFamiliar: ComposicaoFamiliar;

    private constructor(props: {
        id?: string;
        ativo: boolean;
        nome: Nome;
        dataNascimento: Date;
        parentesco: string;
        ceinf: string;
        ceinfBairro: string;
        programaSaudePastoralCrianca: string;
        programaSaudePastoralCriancaLocal: string;
        composicaoFamiliar: ComposicaoFamiliar;
    }) {
        this._id = props.id;
        this._ativo = props.ativo;
        this._nome = props.nome;
        this._dataNascimento = props.dataNascimento;
        this._parentesco = props.parentesco;
        this._ceinf = props.ceinf;
        this._ceinfBairro = props.ceinfBairro;
        this._programaSaudePastoralCrianca = props.programaSaudePastoralCrianca;
        this._programaSaudePastoralCriancaLocal = props.programaSaudePastoralCriancaLocal;
        this._composicaoFamiliar = props.composicaoFamiliar;
        Object.freeze(this);
    }

    private static validar(props: DependenteProps): void {
        if (!props.nome) throw new CampoObrigatorioErro('Dependente: nome');
        if (!props.dataNascimento) throw new CampoObrigatorioErro('Dependente: dataNascimento');
        if (!props.parentesco) throw new CampoObrigatorioErro('Dependente: parentesco');
    }

    public static criar(props: DependenteProps): Dependente {
        this.validar(props);
        return new Dependente({
            id: props.id || crypto.randomUUID(),
            ativo: props.ativo ?? true,
            nome: Nome.criar(props.nome),
            dataNascimento: props.dataNascimento,
            parentesco: props.parentesco,
            ceinf: props.ceinf || '',
            ceinfBairro: props.ceinfBairro || '',
            programaSaudePastoralCrianca: props.programaSaudePastoralCrianca || '',
            programaSaudePastoralCriancaLocal: props.programaSaudePastoralCriancaLocal || '',
            composicaoFamiliar: ComposicaoFamiliar.criar(props.composicaoFamiliar)
        });
    }

    public static rehidratar(props: any): Dependente {
        return new Dependente({
            ...props,
            nome: Nome.criar(props.nome),
        });
    }

    public get id(): string | undefined { return this._id; }
    public get ativo(): boolean { return this._ativo; }
    public get nome(): string { return this._nome.valor; }
    public get dataNascimento(): Date { return this._dataNascimento; }
    public get parentesco(): string { return this._parentesco; }
    public get ceinf(): string { return this._ceinf; }
    public get ceinfBairro(): string { return this._ceinfBairro; }
    public get programaSaudePastoralCrianca(): string { return this._programaSaudePastoralCrianca; }
    public get programaSaudePastoralCriancaLocal(): string { return this._programaSaudePastoralCriancaLocal; }
    public get composicaoFamiliar(): ComposicaoFamiliar { return this.composicaoFamiliar; }

    public toJSON(): DependenteProps {
        return {
            id: this.id,
            ativo: this.ativo,
            nome: this.nome,
            dataNascimento: this.dataNascimento,
            parentesco: this.parentesco,
            ceinf: this.ceinf,
            ceinfBairro: this.ceinfBairro,
            programaSaudePastoralCrianca: this.programaSaudePastoralCrianca,
            programaSaudePastoralCriancaLocal: this.programaSaudePastoralCriancaLocal,
            composicaoFamiliar: this.composicaoFamiliar
        };
    }
}