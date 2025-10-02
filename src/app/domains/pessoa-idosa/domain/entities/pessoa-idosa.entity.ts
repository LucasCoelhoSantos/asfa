import { ComposicaoFamiliar } from '../value-objects/composicao-familiar.vo';
import { Endereco } from '../value-objects/endereco.vo';
import { Dependente, DependenteProps } from '../../../dependente/domain/entities/dependente.entity';
import { Anexo } from '../value-objects/anexo.vo';
import { CPF } from '../value-objects/cpf.vo';
import { RG } from '../value-objects/rg.vo';
import { Telefone } from '../value-objects/telefone.vo';
import { CampoObrigatorioErro } from '../errors/pessoa-idosa.errors';
import { Nome } from '../../../usuario/domain/value-objects/nome.vo';
import { Email } from '../../../usuario/domain/value-objects/email.vo';
import { DependenteFormComponent } from '../../../dependente/presentation/pages/dependente-form/dependente-form';

export interface PessoaIdosaListaDTO {
    id: string;
    nome: string;
    cpf: string;
    telefone: string;
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
    dependentes?: DependenteProps[];
    anexos?: Anexo[];
}

export type AtualizarPessoaIdosaProps = Omit<CriarPessoaIdosaProps, 'id' | 'ativo'>;

export class PessoaIdosa {
    private _id: string;
    private _dataCadastro: Date;
    private _ativo: boolean;
    private _nome: Nome;
    private _dataNascimento: Date;
    private _estadoCivil: string;
    private _cpf: CPF;
    private _rg: RG;
    private _orgaoEmissor: string;
    private _religiao: string;
    private _naturalidade: string;
    private _telefone: Telefone;
    private _email?: Email;
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

    private constructor(props: {
        id: string;
        dataCadastro: Date;
        ativo: boolean;
        nome: Nome;
        dataNascimento: Date;
        estadoCivil: string;
        cpf: CPF;
        rg: RG;
        orgaoEmissor: string;
        religiao: string;
        naturalidade: string;
        telefone: Telefone;
        email?: Email;
        endereco: Endereco;
        prontuarioSaude: string;
        aposentadoConsegueSeManterComSuaRenda: boolean;
        comoComplementa: string;
        beneficio: string;
        observacao: string;
        historicoFamiliarSocial: string;
        composicaoFamiliar: ComposicaoFamiliar;
        dependentes: Dependente[];
        anexos: Anexo[];
    }) {
        this._id = props.id;
        this._dataCadastro = props.dataCadastro;
        this._ativo = props.ativo;
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
        this._dependentes = props.dependentes;
        this._anexos = props.anexos;
    }

    private static validarCamposObrigatorios(props: CriarPessoaIdosaProps): void {
        const camposObrigatorios: (keyof CriarPessoaIdosaProps)[] = [
            'nome', 'dataNascimento', 'estadoCivil', 'cpf', 'rg', 'orgaoEmissor', 'telefone', 'naturalidade', 'endereco', 'telefone', 'email', 'prontuarioSaude',
            'aposentadoConsegueSeManterComSuaRenda', 'beneficio', 'composicaoFamiliar'
        ];
        for (const campo of camposObrigatorios) {
            if (props[campo] === null || props[campo] === undefined || props[campo] === '') {
                throw new CampoObrigatorioErro(campo);
            }
        }
    }

    public static criar(props: CriarPessoaIdosaProps, id?: string): PessoaIdosa {
        this.validarCamposObrigatorios(props);

        return new PessoaIdosa({
            id: id || props.id || '',
            dataCadastro: new Date(),
            ativo: props.ativo ?? true,
            nome: Nome.criar(props.nome),
            dataNascimento: props.dataNascimento,
            estadoCivil: props.estadoCivil,
            cpf: CPF.criar(props.cpf),
            rg: RG.criar(props.rg),
            orgaoEmissor: props.orgaoEmissor,
            religiao: props.religiao,
            naturalidade: props.naturalidade,
            telefone: Telefone.criar(props.telefone),
            email: props.email ? Email.criar(props.email) : undefined,
            prontuarioSaude: props.prontuarioSaude,
            aposentadoConsegueSeManterComSuaRenda: props.aposentadoConsegueSeManterComSuaRenda,
            comoComplementa: props.comoComplementa || '',
            beneficio: props.beneficio,
            observacao: props.observacao || '',
            historicoFamiliarSocial: props.historicoFamiliarSocial || '',
            composicaoFamiliar: props.composicaoFamiliar,
            endereco: props.endereco,
            dependentes: (props.dependentes || []).map(depProps => Dependente.criar(depProps)),
            anexos: props.anexos || [],
        });
    }

    public static rehidratar(props: any): PessoaIdosa {
        return new PessoaIdosa({
            ...props,
            nome: Nome.criar(props.nome),
            email: props.email ? Email.criar(props.email) : undefined,
            cpf: CPF.criar(props.cpf),
            rg: RG.criar(props.rg),
            telefone: Telefone.criar(props.telefone),
            composicaoFamiliar: ComposicaoFamiliar.rehidratar(props.composicaoFamiliar),
            endereco: Endereco.rehidratar(props.endereco),
            dependentes: (props.dependente || []).map((d: any) => Dependente.rehidratar(d)),
            anexos: (props.anexos || []).map((a: any) => Anexo.rehidratar(a))
        });
    }

    public ativar(): void {
        this._ativo = true;
    }

    public inativar(): void {
        this._ativo = false;
    }
    
    public atualizarDados(props: AtualizarPessoaIdosaProps): void {
        PessoaIdosa.validarCamposObrigatorios(props);
        
        this._nome = Nome.criar(props.nome);
        this._dataNascimento = props.dataNascimento;
        this._estadoCivil = props.estadoCivil;
        this._cpf = CPF.criar(props.cpf);
        this._rg = RG.criar(props.rg);
        this._orgaoEmissor = props.orgaoEmissor;
        this._religiao = props.religiao;
        this._naturalidade = props.naturalidade;
        this._telefone = Telefone.criar(props.telefone);
        this._email = props.email ? Email.criar(props.email) : undefined;
        this._prontuarioSaude = props.prontuarioSaude;
        this._aposentadoConsegueSeManterComSuaRenda = props.aposentadoConsegueSeManterComSuaRenda;
        this._comoComplementa = props.comoComplementa || '';
        this._beneficio = props.beneficio;
        this._observacao = props.observacao || '';
        this._historicoFamiliarSocial = props.historicoFamiliarSocial || '';
        this._composicaoFamiliar = props.composicaoFamiliar;
        this._endereco = props.endereco;
        this._dependentes = (props.dependentes || []).map(depProps => Dependente.criar(depProps));
        this._anexos = props.anexos ?? this._anexos;
    }

    public get id(): string { return this._id; }
    public get dataCadastro(): Date { return this._dataCadastro; }
    public get ativo(): boolean { return this._ativo; }
    public get nome(): string { return this._nome.valor; }
    public get dataNascimento(): Date { return this._dataNascimento; }
    public get estadoCivil(): string { return this._estadoCivil; }
    public get cpf(): string { return this._cpf.valor; }
    public get rg(): string { return this._rg.valor; }
    public get orgaoEmissor(): string { return this._orgaoEmissor; }
    public get religiao(): string { return this._religiao; }
    public get naturalidade(): string { return this._naturalidade; }
    public get telefone(): string { return this._telefone.valor; }
    public get email(): string | undefined { return this._email?.valor; }
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

    public toJSON() {
        return {
            id: this.id,
            dataCadastro: this.dataCadastro,
            ativo: this.ativo,
            nome: this.nome,
            dataNascimento: this.dataNascimento,
            estadoCivil: this.estadoCivil,
            cpf: this.cpf,
            rg: this.rg,
            orgaoEmissor: this.orgaoEmissor,
            religiao: this.religiao,
            naturalidade: this.naturalidade,
            telefone: this.telefone,
            email: this.email,
            prontuarioSaude: this.prontuarioSaude,
            aposentadoConsegueSeManterComSuaRenda: this.aposentadoConsegueSeManterComSuaRenda,
            comoComplementa: this.comoComplementa,
            beneficio: this.beneficio,
            observacao: this.observacao,
            historicoFamiliarSocial: this.historicoFamiliarSocial,
            composicaoFamiliar: this.composicaoFamiliar.toJSON(),
            endereco: this.endereco.toJSON(),
            dependentes: this.dependentes.map(dependente => dependente.toJSON),
            anexos: this.anexos.map(anexo => anexo.toJSON()),
        };
    }
}