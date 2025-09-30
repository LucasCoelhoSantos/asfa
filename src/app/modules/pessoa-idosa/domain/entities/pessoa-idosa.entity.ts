import { ComposicaoFamiliar } from '../value-objects/composicao-familiar.vo';
import { Endereco } from '../value-objects/endereco.vo';
import { Dependente } from '../../../dependente/domain/entities/dependente.entity';
import { Anexo } from '../value-objects/anexo.vo';

export interface PessoaIdosa {
    id: string;
    dataCadastro: Date;
    nome: string;
    dataNascimento: Date;
    ativo: boolean;
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
    anexos: Anexo[];
}

export interface PessoaIdosaListaDTO {
    nome: string;
    cpf: string;
    telefone: string;
    rg: string;
    endereco: Endereco;
    dataNascimento: Date;
    ativo: boolean;
}
