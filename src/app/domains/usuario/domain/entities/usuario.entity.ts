import { CargoUsuario } from "../value-objects/enums";
import { Email } from "../value-objects/email.vo";
import { Nome } from "../value-objects/nome.vo";

export interface CriarUsuarioProps {
    nome: string;
    email: string;
    cargo: CargoUsuario;
    ativo?: boolean;
}

export interface AtualizarPerfilProps {
    nome: string;
    email: string;
}

export interface AtualizarDadosAdminProps {
    nome: string;
    email: string;
    cargo: CargoUsuario;
}

export class Usuario {
    private _id: string;
    private _nome: Nome;
    private _email: Email;
    private _cargo: CargoUsuario;
    private _ativo: boolean;
    private _dataCadastro: Date;

    private constructor(props: {
        id: string;
        nome: Nome;
        email: Email;
        cargo: CargoUsuario;
        ativo: boolean;
        dataCadastro: Date;
    }) {
        this._id = props.id;
        this._nome = props.nome;
        this._email = props.email;
        this._cargo = props.cargo;
        this._ativo = props.ativo;
        this._dataCadastro = props.dataCadastro;
    }

    public static criar(props: CriarUsuarioProps, id?: string): Usuario {
        return new Usuario({
            id: id || '',
            nome: Nome.criar(props.nome),
            email: Email.criar(props.email),
            cargo: props.cargo,
            ativo: props.ativo ?? true,
            dataCadastro: new Date(),
        });
    }

    public static rehidratar(props: {
        id: string;
        nome: string;
        email: string;
        cargo: CargoUsuario;
        ativo: boolean;
        dataCadastro: Date;
    }): Usuario {
        return new Usuario({
            id: props.id,
            nome: Nome.criar(props.nome),
            email: Email.criar(props.email),
            cargo: props.cargo,
            ativo: props.ativo,
            dataCadastro: props.dataCadastro,
        });
    }

    public inativar(): void {
        if (!this._ativo) {
            throw new Error('Usuário já está inativo.');
        }
        this._ativo = false;
    }
    
    public ativar(): void {
        if (this._ativo) {
            throw new Error('Usuário já está ativo.');
        }
        this._ativo = true;
    }

    public atualizarPerfil(props: AtualizarPerfilProps): void {
        this._nome = Nome.criar(props.nome);
    }

    public atualizarDadosAdministrativos(props: AtualizarDadosAdminProps): void {
        this._nome = Nome.criar(props.nome);
        //this._cargo = Cargo.criar(props.cargo);
        this._cargo = props.cargo;
    }

    public get id(): string { return this._id; }
    public get nome(): string { return this._nome.valor; }
    public get email(): string { return this._email.valor; }
    public get cargo(): CargoUsuario { return this._cargo; }
    public get ativo(): boolean { return this._ativo; }
    public get dataCadastro(): Date { return this._dataCadastro; }

    public toJSON() {
        return {
            id: this._id,
            nome: this._nome,
            email: this._email,
            cargo: this._cargo,
            ativo: this._ativo,
            dataCadastro: this.dataCadastro
        };
    }
}