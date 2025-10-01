import { ComposicaoFamiliar } from '../value-objects/composicao-familiar.vo';
import { Endereco } from '../value-objects/endereco.vo';
import { Dependente } from '../../../dependente/domain/entities/dependente.entity';
import { Anexo } from '../value-objects/anexo.vo';

export interface PessoaIdosaListaDTO {
    nome: string;
    cpf: string;
    telefone: string;
    rg: string;
    endereco: Endereco;
    dataNascimento: Date;
    ativo: boolean;
}

export interface CriarPessoaIdosaProps {
    id?: string;
    ativo?: boolean;
    nome: string;
    dataNascimento: Date;
    estadoCivil: string;
    cpf: string;
    rg: string;
    orgaoEmissor: string;
    religiao: string;
    naturalidade: string;
    telefone: string;
    email?: string;
    prontuarioSaude: string;
    aposentadoConsegueSeManterComSuaRenda: boolean;
    comoComplementa: string;
    beneficio: string;
    observacao: string;
    historicoFamiliarSocial: string;
    composicaoFamiliar: ComposicaoFamiliar;
    endereco: Endereco;
    dependentes: Dependente[];
    anexos?: Anexo[];
}

export type AtualizarPessoaIdosaProps = Partial<Omit<CriarPessoaIdosaProps, 'id' | 'dataCadastro' | 'ativo'>>;

export class PessoaIdosa {
    private _id: string;
    private _dataCadastro: Date;
    private _ativo: boolean;
    private _nome: string;
    private _dataNascimento: Date;
    private _estadoCivil: string;
    private _cpf: string;
    private _rg: string;
    private _orgaoEmissor: string;
    private _religiao: string;
    private _naturalidade: string;
    private _telefone: string;
    private _email?: string;
    private _prontuarioSaude: string;
    private _aposentadoConsegueSeManterComSuaRenda: boolean;
    private _comoComplementa: string;
    private _beneficio: string;
    private _observacao: string;
    private _historicoFamiliarSocial: string;
    private _composicaoFamiliar: ComposicaoFamiliar;
    private _endereco: Endereco;
    private _dependentes: Dependente[];
    private _anexos: Anexo[];

    private constructor(props: CriarPessoaIdosaProps) {
        if (!props.nome?.trim()) throw new Error("O nome da pessoa idosa é obrigatório.");
        if (!props.dataNascimento) throw new Error("A data de nascimento é obrigatória.");
        if (!props.estadoCivil?.trim()) throw new Error("O estado civil é obrigatório.");
        if (!props.cpf?.trim()) throw new Error("O CPF é obrigatório.");
        if (!props.rg?.trim()) throw new Error("O RG é obrigatório.");
        if (!props.orgaoEmissor?.trim()) throw new Error("O Órgão Emissor é obrigatório.");
        if (!props.telefone?.trim()) throw new Error("O telefone é obrigatório.");
        if (!props.endereco) throw new Error("O endereço é obrigatório.");

        this._id = props.id || ''; // O ID pode ser definido posteriormente pelo repositório
        this._dataCadastro = new Date();
        this._ativo = props.ativo ?? true;
        this._nome = props.nome;
        this._dataNascimento = props.dataNascimento;
        this._estadoCivil = props.estadoCivil;
        this._cpf = props.cpf;
        this._rg = props.rg;
        this._orgaoEmissor = props.orgaoEmissor;
        this._religiao = props.religiao;
        this._naturalidade = props.naturalidade;
        this._telefone = props.telefone;
        this._email = props.email;
        this._prontuarioSaude = props.prontuarioSaude;
        this._aposentadoConsegueSeManterComSuaRenda = props.aposentadoConsegueSeManterComSuaRenda;
        this._comoComplementa = props.comoComplementa;
        this._beneficio = props.beneficio;
        this._observacao = props.observacao;
        this._historicoFamiliarSocial = props.historicoFamiliarSocial;
        this._composicaoFamiliar = props.composicaoFamiliar;
        this._endereco = props.endereco;
        this._dependentes = props.dependentes || [];
        this._anexos = props.anexos || [];
    }

    public static criar(props: CriarPessoaIdosaProps): PessoaIdosa {
        return new PessoaIdosa(props);
    }
    
    public ativar(): void {
        this._ativo = true;
    }

    public inativar(): void {
        this._ativo = false;
    }

    public atualizarDados(props: AtualizarPessoaIdosaProps): void {
        if (!props.nome?.trim()) throw new Error("O nome da pessoa idosa é obrigatório.");
        if (!props.dataNascimento) throw new Error("A data de nascimento é obrigatória.");
        if (!props.estadoCivil?.trim()) throw new Error("O estado civil é obrigatório.");
        if (!props.cpf?.trim()) throw new Error("O CPF é obrigatório.");
        if (!props.rg?.trim()) throw new Error("O RG é obrigatório.");
        if (!props.orgaoEmissor?.trim()) throw new Error("O Órgão Emissor é obrigatório.");
        if (!props.telefone?.trim()) throw new Error("O telefone é obrigatório.");
        if (!props.endereco) throw new Error("O endereço é obrigatório.");
        
        this._nome = props.nome ?? this._nome;
        this._dataNascimento = props.dataNascimento ?? this._dataNascimento;
        this._estadoCivil = props.estadoCivil ?? this._estadoCivil;
        this._cpf = props.cpf ?? this._cpf;
        this._rg = props.rg ?? this._rg;
        this._orgaoEmissor = props.orgaoEmissor ?? this._orgaoEmissor;
        this._religiao = props.religiao ?? this._religiao;
        this._naturalidade = props.naturalidade ?? this._naturalidade;
        this._telefone = props.telefone ?? this._telefone;
        this._email = props.email ?? this._email;
        this._prontuarioSaude = props.prontuarioSaude ?? this._prontuarioSaude;
        this._aposentadoConsegueSeManterComSuaRenda = props.aposentadoConsegueSeManterComSuaRenda ?? this._aposentadoConsegueSeManterComSuaRenda;
        this._comoComplementa = props.comoComplementa ?? this._comoComplementa;
        this._beneficio = props.beneficio ?? this._beneficio;
        this._observacao = props.observacao ?? this._observacao;
        this._historicoFamiliarSocial = props.historicoFamiliarSocial ?? this._historicoFamiliarSocial;
        this._composicaoFamiliar = props.composicaoFamiliar ?? this._composicaoFamiliar;
        this._endereco = props.endereco ?? this._endereco;
        this._dependentes = props.dependentes ?? this._dependentes;
        this._anexos = props.anexos ?? this._anexos;
    }

    // Getters para expor o estado de forma controlada
    public get id(): string { return this._id; }
    public get dataCadastro(): Date { return this._dataCadastro; }
    public get nome(): string { return this._nome; }
    public get dataNascimento(): Date { return this._dataNascimento; }
    public get ativo(): boolean { return this._ativo; }
    public get estadoCivil(): string { return this._estadoCivil; }
    public get cpf(): string { return this._cpf; }
    public get rg(): string { return this._rg; }
    public get orgaoEmissor(): string { return this._orgaoEmissor; }
    public get religiao(): string { return this._religiao; }
    public get naturalidade(): string { return this._naturalidade; }
    public get telefone(): string { return this._telefone; }
    public get email(): string | undefined { return this._email; }
    public get prontuarioSaude(): string { return this._prontuarioSaude; }
    public get aposentadoConsegueSeManterComSuaRenda(): boolean { return this._aposentadoConsegueSeManterComSuaRenda; }
    public get comoComplementa(): string { return this._comoComplementa; }
    public get beneficio(): string { return this._beneficio; }
    public get observacao(): string { return this._observacao; }
    public get historicoFamiliarSocial(): string { return this._historicoFamiliarSocial; }
    public get composicaoFamiliar(): ComposicaoFamiliar { return this._composicaoFamiliar; }
    public get endereco(): Endereco { return this._endereco; }
    public get dependentes(): Dependente[] { return this._dependentes; }
    public get anexos(): Anexo[] { return this._anexos; }

    // Método para facilitar a persistência
    public toJSON() {
        return {
            id: this._id,
            dataCadastro: this._dataCadastro,
            nome: this._nome,
            dataNascimento: this._dataNascimento,
            ativo: this._ativo,
            estadoCivil: this._estadoCivil,
            cpf: this._cpf,
            rg: this._rg,
            orgaoEmissor: this._orgaoEmissor,
            religiao: this._religiao,
            naturalidade: this._naturalidade,
            telefone: this._telefone,
            email: this._email,
            prontuarioSaude: this._prontuarioSaude,
            aposentadoConsegueSeManterComSuaRenda: this._aposentadoConsegueSeManterComSuaRenda,
            comoComplementa: this._comoComplementa,
            beneficio: this._beneficio,
            observacao: this._observacao,
            historicoFamiliarSocial: this._historicoFamiliarSocial,
            composicaoFamiliar: this._composicaoFamiliar.toJSON(),
            endereco: this._endereco.toJSON(),
            dependentes: this._dependentes,
            anexos: this._anexos.map(anexo => anexo.toJSON()),
        };
    }
}